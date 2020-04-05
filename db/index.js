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
        pool.query(`SELECT * FROM
                        (SELECT * FROM agent
                        LEFT JOIN languages USING(agent_id)
                        LEFT JOIN skills USING(agent_id)) A
                    WHERE ${keyTerm} = 1;`, (err, results) => {
           if(err) {
               console.log('err');
               return reject(err);
           }
           console.log(results);
           return resolve(results);
       });
   });
};


let filterAgents = (filters) => {
    return new Promise((resolve, reject) => {

        var filterArray = [];
        for (var i in filters) {
            console.log(filters[i]);
            filterArray.push(`${filters[i]} = 1`);
        }

        let toBeQueried = `SELECT * FROM (
                                SELECT * FROM agent
                                LEFT JOIN languages USING(agent_id)
                                LEFT JOIN skills USING(agent_id)) A
                            WHERE availability = 1 AND ${filterArray.join(' AND ')};`;
        pool.query(toBeQueried, (err, results) => {
                    if (err) {
                        console.log('err');
                        return reject(err);
                    }

                    return resolve(results);
        });
    })
};

let freeAgents = () => {
    return new Promise((resolve, reject) => {

        let toBeQueried = `SELECT * FROM (
                                SELECT * FROM agent
                                LEFT JOIN languages USING(agent_id)
                                LEFT JOIN skills USING(agent_id)) A
                            WHERE availability = 1
                            ORDER BY count ASC;`;
        pool.query(toBeQueried, (err, results) => {
                    if (err) {
                        console.log('err');
                        return reject(err);
                    }

                    return resolve(results);
        });
    })
};

let routeForAgent = async (filters) => {
    if (filters[0] == null) {
        console.log("empty filters")
        var suitableAgents = await freeAgents();
    } else {
        var suitableAgents = await filterAgents(filters);
    }
    console.log(suitableAgents);
    if (suitableAgents.length == 0) return null;

    return {selectedAgent: suitableAgents[0].agent_id};
};


/* Create Methods */

let addAgent = (rainbow_id, personalInfo) => {
    return new Promise((resolve, reject) => {

        pool.query(`INSERT INTO agent(agent_id, firstname, lastname, email)
                    VALUES ("${rainbow_id}", "${personalInfo.firstname}", "${personalInfo.lastname}", "${personalInfo.email}");`,
                    (err, results) => {
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

        pool.query(`INSERT INTO languages(agent_id, english, chinese, malay)
                    VALUES ("${rainbow_id}", "${dir.languages.english}",
                    "${dir.languages.chinese}", "${dir.languages.malay}");
                    INSERT INTO skills(agent_id, insurance, bank_statement, fraud)
                    VALUES ("${rainbow_id}", "${dir.skills.insurance}",
                    "${dir.skills.bank_statement}", "${dir.skills.fraud}");`,
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

/* UPDATE METHODS */

let updateAgentDetails = (toBeChangedJson) => {
    return new Promise((resolve, reject) => {

        var overallArray = [];

        if (toBeChangedJson.hasOwnProperty("personalInfo")) {
            var currentUpdateArray = [];
            for (var key in toBeChangedJson.personalInfo) {
                currentUpdateArray.push(`${key} = '${toBeChangedJson.personalInfo[key]}'`);
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
                    currentUpdateArray.push(`${innerKey} = '${rootDir[key][innerKey]}'`);
                }
                let currentUpdate = `UPDATE ${key} SET ` + currentUpdateArray.join(', ') +` WHERE (agent_id = '${toBeChangedJson.rainbow_id}');`;
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

let changeAvailability = (rainbow_id, availability) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE agent SET availability = ${availability} WHERE agent_id = "${rainbow_id}";`,
                    (err, results) => {
                        if (err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        checkChangesToDb(results, resolve, reject);
                    });
    })
};

let incrementCount = (rainbow_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT count FROM agent WHERE agent_id = "${rainbow_id}";`,
                    (err, countResults) => {
                        if (err || countResults[0] == null) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log("hihi");
                        console.log(countResults[0].count);
                        pool.query(`UPDATE agent SET count = ${countResults[0].count+1} WHERE agent_id = "${rainbow_id}";`,
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
        pool.query(`DELETE FROM languages WHERE (agent_id = '${rainbow_id}');
                    DELETE FROM skills WHERE (agent_id = '${rainbow_id}');
                    DELETE FROM agent WHERE (agent_id = '${rainbow_id}');`,
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
    routeForAgent
};
