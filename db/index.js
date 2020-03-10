const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    password: 'b1b6fc44',
    user:'bdf76656acdd9a',
    database:'heroku_c93ca8b3152014d',
    host: 'us-cdbr-iron-east-04.cleardb.net',
    port: '3306',
    multipleStatements: true
});



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
}


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
}
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
                'bank statement': 0,
                fraud: 0
            }
        }

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
                    INSERT INTO skills(agent_id, insurance, \`bank statement\`, fraud)
                    VALUES ("${rainbow_id}", "${dir.skills.insurance}", 
                    "${dir.skills["bank statement"]}", "${dir.skills.fraud}");`, 
                    (err, results) => {
                        if(err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        return resolve(results);
                    });
    })
}

/* UPDATE METHODS */

let updateAgentDetails = (toBeChangedJson) => {
    return new Promise((resolve, reject) => {

        var overallArray = [];
        
        if (toBeChangedJson.hasOwnProperty("personalInfo")) {
            var currentUpdateArray = [];
            for (var key in toBeChangedJson.personalInfo) {
                currentUpdateArray.push(`${innerKey} = ${rootDir[key][innerKey]}`);
            }
            let currentUpdate = `UPDATE agent SET ` + currentUpdateArray.join(', ') +` WHERE (agent_id = '${toBeChangedJson.rainbow_id}');`;
            overallArray.push(currentUpdate);
        }

        if (toBeChangedJson.hasOwnProperty("details")) {
            var rootDir = toBeChangedJson.details;
            for (var key in rootDir) {
                var currentUpdateArray = [];
                console.log(rootDir[key]);
                for (var innerKey in rootDir[key]) {
                    currentUpdateArray.push(`${innerKey} = ${rootDir[key][innerKey]}`);
                }
                let currentUpdate = `UPDATE ${key} SET ` + currentUpdateArray.join(', ') +` WHERE (agent_id = '${toBeChangedJson.rainbow_id}');`;
                overallArray.push(currentUpdate);
            }
        }
        
        pool.query(`${overallArray.join('\n')}`, 
                    (err, results) => {
                        if(err) {
                            console.log('err');
                            return reject(err);
                        }
                        console.log(results);
                        return resolve(results);
                    });
    })
}

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
                        return resolve(results);
                    });
    })
}




module.exports = {
    agentInfo,
    joinAllTables,
    query,
    addAgent,
    initialiseAgentDetails,
    updateAgentDetails,
    deleteAgent
};