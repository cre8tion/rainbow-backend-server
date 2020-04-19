const mysql = require('mysql');
require('dotenv').config();
const separators = ['\\/+','\\:+','\\@+','\\?+'];

try{
  const CLEARDB_DATABASE_ARRAY = process.env.CLEARDB_DATABASE_URL.split(new RegExp(separators.join('|'), 'g'));
  const CLEARDB_DATABASE_JSON = {
    user: CLEARDB_DATABASE_ARRAY[2],
    password: CLEARDB_DATABASE_ARRAY[3],
    host: CLEARDB_DATABASE_ARRAY[4],
    database: CLEARDB_DATABASE_ARRAY[5],
    port: '3306',
    connectionLimit: 10,
    multipleStatements: true
  };
  console.log(CLEARDB_DATABASE_JSON);

  var pool = mysql.createPool(CLEARDB_DATABASE_JSON);
} catch (e) {
  console.log(e);
}

/* Helper function: check if any data has been affected */
var checkChangesToDb = (response, resolve, reject) => {
    if (response instanceof Array) {
        if (response[0].affectedRows == 0) {
            return reject("rainbow_id does not exist.");
        } else {
            return resolve(response);
        }
    } else {
        if (response.affectedRows == 0) {
            return reject("rainbow_id does not exist.");
        } else {
            return resolve(response);
        }
    }
};


/* QUERYING METHODS */
let agentInfo = () => {
    return new Promise((resolve, reject) => {
         pool.query(`SELECT * FROM agent`, (err, results) => {
            if(err) {
                console.log('err');
                return reject(err);
            }
            console.log(results);
            return resolve(results);
        });
    });
};

let joinAllTables = () => {
    return new Promise((resolve, reject) => {
         pool.query(`SELECT * FROM agent
                    LEFT JOIN languages USING(agent_id)
                    LEFT JOIN skills USING(agent_id);`, (err, results) => {
            if(err) {
                console.log('err');
                return reject(err);
            }
            console.log(results);
            return resolve(results);
        });
    });
};

let query = (keyTerm) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT * FROM 
                (SELECT * FROM agent 
                LEFT JOIN languages USING(agent_id) 
                LEFT JOIN skills USING(agent_id)) A 
                WHERE ?? = 1;`;
        let inserts = [keyTerm];
        pool.query(mysql.format(q, inserts), (err, results) => {
           if(err) {
               console.log('err');
               return reject(err);
           }
           console.log(results);
           return resolve(results);
       });
   });
};


let filterAgents = (connection, filters) => {
    return new Promise((resolve, reject) => {

        var filterArray = [];
        for (var i in filters) {
            console.log(filters[i]);
            filterArray.push(`${mysql.escapeId(filters[i])} = 1`);
        }
        let q = `SELECT * FROM (
                    SELECT * FROM agent
                    LEFT JOIN languages USING(agent_id)
                    LEFT JOIN skills USING(agent_id)
                    FOR UPDATE) A
                WHERE availability = 1 AND ${filterArray.join(' AND ')}
                ORDER BY count ASC
                FOR UPDATE;`;
        connection.query(q, (err, results) => {
                    if (err) {
                        console.log('err');
                        connection.rollback(() => {
                            connection.release();
                            return reject(err);
                        });
                    }
                    return resolve(results);
        });
    })
};

let freeAgents = (connection) => {
    return new Promise((resolve, reject) => {

        let q = `SELECT * FROM (
                    SELECT * FROM agent
                    LEFT JOIN languages USING(agent_id)
                    LEFT JOIN skills USING(agent_id)
                    FOR UPDATE) A
                WHERE availability = 1
                ORDER BY count ASC
                FOR UPDATE;`;
        connection.query(q, (err, results) => {
                    if (err) {
                        console.log('err');
                        connection.rollback(() => {
                            connection.release();
                            return reject(err);
                        })
                    }
                    return resolve(results);
        });
    })
};

let checkIfBusyAgent = (connection, filters) => {
    return new Promise((resolve, reject) => {

        var filterArray = [];
        for (var i in filters) {
            console.log(filters[i]);
            filterArray.push(`${mysql.escapeId(filters[i])} = 1`);
        }
        let q = `SELECT * FROM (
                    SELECT * FROM agent
                    LEFT JOIN languages USING(agent_id)
                    LEFT JOIN skills USING(agent_id)
                    FOR UPDATE) A
                WHERE availability = 2 AND ${filterArray.join(' AND ')}
                FOR UPDATE;`;
        connection.query(q, (err, results) => {
                    if (err) {
                        console.log('err');
                        connection.rollback(() => {
                            connection.release();
                            return reject(err);
                        });
                    }
                    if (results[0] == null) return resolve(false);
                    else return resolve(true);
        });
    })

}

let helperForRouting = async (err, connection, filters) => {
    if (err) { // Transaction error
        connection.rollback(() => {
            connection.release();
        });
    }
    else {
        if (filters[0] == null) {
            console.log("empty filters");
            var suitableAgents = await freeAgents(connection);
        }
        else {
            var suitableAgents = await filterAgents(connection, filters);
        }
        console.log(suitableAgents);
        if (suitableAgents.length == 0) {
            if (await checkIfBusyAgent(connection, filters)) {
                console.log("connection released");
                connection.commit(() => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();
                        });
                    }
                    else {
                        connection.release();
                    }
                });
                var resJson = {
                    status: 2
                };
                return resJson
            }
            else {
                console.log("connection released");
                connection.commit(() => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();
                        });
                    }
                    else {
                        connection.release();
                    }
                });
                var resJson = {
                    status: 0
                };
                return resJson
            }
        }
        let selectedAgent = suitableAgents[0].agent_id;
        await changeAvailability(selectedAgent, 2, connection);
        await incrementCount(connection, selectedAgent);
        console.log("connection released");
        connection.commit(() => {
            if (err) {
                connection.rollback(() => {
                    connection.release();
                });
            }
            else {
                connection.release();
            }
        });
        var resJson = {
            selectedAgent: selectedAgent,
            status: 1
        };
        return resJson;
    }
}

let routeForAgent = async (filters) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            connection.beginTransaction(async (err) => {
                if (err) {
                    reject(err);
                }
                resolve(helperForRouting(err, connection, filters));
            });
        });
    })
};


/* Create Methods */

let addAgent = (rainbow_id, personalInfo) => {
    return new Promise((resolve, reject) => {
        let q = `INSERT INTO agent(agent_id, firstname, lastname, email)
        VALUES (?, ?, ?, ?);`;
        let inserts = [rainbow_id, personalInfo.firstname, personalInfo.lastname, personalInfo.email];
        q = mysql.format(q, inserts);
        pool.query(q, (err, results) => {
                        if(err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        return resolve(results);
                    });
    })
};

let initialiseAgentDetails = (rainbow_id, details) => {
    return new Promise((resolve, reject) => {
        let dir = {
            languages: {
                english: 0,
                chinese: 0,
                malay: 0
            },
            skills: {
                insurance: 0,
                bank_statement: 0,
                fraud: 0
            }
        };

        for (var key in dir) {
            if (details.hasOwnProperty(key)) {
                for (var key2 in dir[key]) {
                    if (details[key].hasOwnProperty(key2)) {
                        dir[key][key2] = details[key][key2]
                    }
                }
            }
        }
        let q = `INSERT INTO languages(agent_id, english, chinese, malay)
        VALUES (?, ?, ?, ?);
        INSERT INTO skills(agent_id, insurance, bank_statement, fraud)
        VALUES (?, ?, ?, ?);`;
        let inserts = [rainbow_id, dir.languages.english, dir.languages.chinese, dir.languages.malay, rainbow_id, dir.skills.insurance, dir.skills.bank_statement, dir.skills.fraud];
        q = mysql.format(q, inserts);
        pool.query(q, (err, results) => {
                        if(err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        checkChangesToDb(results, resolve, reject);
                    });
    })
};

/* UPDATE METHODS */

let updateAgentDetails = (toBeChangedJson) => {
    return new Promise((resolve, reject) => {

        var overallArray = [];

        if (toBeChangedJson.hasOwnProperty("personalInfo")) {
            var currentUpdateArray = [];
            for (var key in toBeChangedJson.personalInfo) {
                currentUpdateArray.push(`${pool.escapeId(key)} = ${pool.escape(toBeChangedJson.personalInfo[key])}`);
            }
            let currentUpdate = `UPDATE agent SET ${currentUpdateArray.join(', ')} WHERE (agent_id = '${toBeChangedJson.rainbow_id}');`;
            overallArray.push(currentUpdate);
        }

        if (toBeChangedJson.hasOwnProperty("details")) {
            var rootDir = toBeChangedJson.details;
            for (var key in rootDir) {
                var currentUpdateArray = [];
                console.log(rootDir[key]);
                for (var innerKey in rootDir[key]) {
                    currentUpdateArray.push(`${pool.escapeId(innerKey)} = ${pool.escape(rootDir[key][innerKey])}`);
                }
                let currentUpdate = `UPDATE ${pool.escapeId(key)} SET ` + currentUpdateArray.join(', ') +` WHERE (agent_id = '${toBeChangedJson.rainbow_id}');`;
                overallArray.push(currentUpdate);
            }
        }
        console.log(overallArray.join('\n'));

        pool.query(`${overallArray.join('\n')}`,
                    (err, results) => {
                        if(err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        checkChangesToDb(results, resolve, reject);
                    });
    })
};

let changeAvailability = (rainbow_id, availability, connection) => {
    if (typeof connection === "undefined") {
        var transaction = false;
    } else {
        var transaction = true;
    }
    return new Promise((resolve, reject) => {
        let q = `UPDATE agent SET availability = ? WHERE agent_id = ?;`;
        let inserts = [availability, rainbow_id];
        q = mysql.format(q, inserts);
        if (transaction == true) {
            connection.query(q, (err, results) => {
                if (err) {
                    console.log('err');
                    connection.rollback(() => {
                        connection.release();
                        return reject(err);
                    });
                }
                checkChangesToDb(results, resolve, reject);
            });
        } else {
            pool.query(q, (err, results) => {
                            if (err) {
                                console.log('err');
                                return reject(err);
                            }
                            console.log(results);
                            checkChangesToDb(results, resolve, reject);
                        });
        }
    })
};

let incrementCount = (connection, rainbow_id) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT count FROM agent WHERE agent_id = ?
                 FOR UPDATE;`;
        let inserts = [rainbow_id];
        q = mysql.format(q, inserts);
        connection.query(q, (err, countResults) => {
                        if (err || countResults[0] == null) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(countResults[0].count);
                        connection.query(`UPDATE agent SET count = ${countResults[0].count+1} WHERE agent_id = "${rainbow_id}";`,
                        (err, results) => {
                            if (err) {
                                console.log('err');
                                return reject(err);
                            }
                            console.log(results);
                            checkChangesToDb(results, resolve, reject);
                        })
                    })
        
    })
};

/* DELETE method */
let deleteAgent = (rainbow_id) => {
    return new Promise((resolve, reject) => {
        let q = `DELETE FROM languages WHERE (agent_id = ?);
        DELETE FROM skills WHERE (agent_id = ?);
        DELETE FROM agent WHERE (agent_id = ?);`
        let inserts = [rainbow_id, rainbow_id, rainbow_id]
        q = mysql.format(q, inserts);
        pool.query(q, (err, results) => {
                        if(err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        checkChangesToDb(results, resolve, reject);
                    });
    })
};

/* RATE AGENTS */
let rateAgent = (rainbow_id, rating) => {
    return new Promise((resolve, reject) => {
        let q = `SELECT rating, rating_count FROM agent WHERE agent_id = ?;`;
        let inserts = [rainbow_id];
        q = mysql.format(q, inserts);
        pool.query(q, (err, results) => {
                        if (err || results[0] == null) {
                            console.log('err');
                            return reject(err);
                        }
                        let prev_rating = results[0].rating;
                        let prev_count = results[0].rating_count;
                        let after_rating = (parseFloat(prev_rating * prev_count) + parseInt(rating))/(prev_count + 1);
                        let q = `UPDATE agent SET rating_count = ${prev_count+1} WHERE agent_id = ?;
                                 UPDATE agent SET rating = ${after_rating} WHERE agent_id = ?;`;
                        let inserts = [rainbow_id, rainbow_id];
                        q = mysql.format(q, inserts);
                        pool.query(q, (err, results) => {
                            if (err) {
                                console.log('err');
                                return reject(err);
                            }
                            console.log(results);
                            checkChangesToDb(results, resolve, reject);
                        })
                    })
    })
}

//do something when app is closing
process.on('exit', shutdown);

//catches ctrl+c event
process.on('SIGINT', shutdown);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', shutdown);
process.on('SIGUSR2', shutdown);

//catches uncaught exceptions
process.on('uncaughtException', shutdown);


function shutdown() {
    console.log("received shutdown signal");
    pool.end();
    console.log("mySql pool terminated");
}

module.exports = {
    agentInfo,
    joinAllTables,
    query,
    addAgent,
    initialiseAgentDetails,
    updateAgentDetails,
    deleteAgent,
    changeAvailability,
    incrementCount,
    routeForAgent,
    rateAgent
};
