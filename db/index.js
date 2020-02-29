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

let allData = {};
allData.all = () => {
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

module.exports = {
    test1: allData,
    // test2: allAgentLanguage
};