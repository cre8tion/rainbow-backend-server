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

// let agentInfo = {};
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
                    FROM innop.agent 
                        LEFT JOIN innop.languages USING(agent_id)
                        LEFT JOIN innop.skillsets USING(agent_id);`, (err, results) => {
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
                   FROM innop.agent 
                       LEFT JOIN innop.${queryTable} USING(agent_id)
                       WHERE innop.${queryTable}.${keyTerm} = 1;`, (err, results) => {
           if(err) {
               console.log('err');
               return reject(err);
           }
           console.log(results);
           return resolve(results);
       });
   });
}

let querySkillset = (keyTerm) => {
    return query("skillsets",keyTerm);
};

let queryLanguage = (keyTerm) => {
    return query("languages",keyTerm);
};

module.exports = {
    agentInfo: agentInfo,
    joinAllTables: joinAllTables,
    querySkillset: querySkillset,
    queryLanguage: queryLanguage
};