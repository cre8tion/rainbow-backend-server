const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    password: 'Sutd1234',
    user:'root',
    database:'innop',
    host: 'localhost',
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
         pool.query(`SELECT * 
                    FROM agent 
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

let query = (queryTable, keyTerm) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * 
                   FROM agent 
                       LEFT JOIN ${queryTable} USING(agent_id)
                       WHERE ${queryTable}.${keyTerm} = 1;`, (err, results) => {
           if(err) {
               console.log('err');
               return reject(err);
           }
           console.log(results);
           return resolve(results);
       });
   });
}

let querySkills = (keyTerm) => {
    return query("skills",keyTerm);
};

let queryLanguage = (keyTerm) => {
    return query("languages",keyTerm);
};

/* Create Methods */

let addAgent = (rainbow_id, name) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO agent(agent_id, name)
                    VALUES ("${rainbow_id}", "${name}");`, (err, results) => {
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



module.exports = {
    agentInfo,
    joinAllTables,
    querySkills,
    queryLanguage,
    addAgent,
    initialiseAgentDetails

};