const express = require('express');
// const {agentInfo, joinAllTables, queryLanguage, querySkills,} = require('../db');
import db from '../db';
const {handler, ErrorHandler, DefaultError} = require('./errorHandle');

const router = express.Router();

router.use(express.json());       // to support JSON-encoded bodies
router.use(express.urlencoded()); // to support URL-encoded bodies

/* RETRIEVE ALL INFO */
router.get('/test:p', async (req, res, next) => {
    const di = {
        1: db.agentInfo,
        2: db.joinAllTables
    }

    try{
        let func = di[req.params.p];
        let results = await func();
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

/* SELECTIVE QUERYING OF LANGUAGES AND SKILLSETS */

router.get('/querySkills/:keyTerm', async (req, res, next) => {

    try{
        let results = await db.querySkills(req.params.keyTerm);
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.get('/queryLanguage/:keyTerm', async (req, res, next) => {

    try{
        let results = await db.queryLanguage(req.params.keyTerm);
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

/* ADMINISTRATIVE FUNCTIONS:
* ADD AGENT
* UPDATE AGENT
* DELETE AGENT
* VIEW AGENT
*/

router.get('/admin/viewAll', async (req, res, next) => {
    try {
        let results = await db.joinAllTables();
        res.json(results);
    } catch(e) {
        console.log(e);
        next(new DefaultError());
    }
})

router.post('/admin/add/', async (req, res, next) => {
    try {
        let rainbow_id = req.body.rainbow_id;
        let name = req.body.name;
        let details = req.body.details;
        await db.addAgent(rainbow_id, name);
        let results = await db.initialiseAgentDetails(rainbow_id, details);
        res.json(results);
    } catch(e) {
        console.log(e);
        let error = new ErrorHandler(400, e.sqlMessage);
        next(error);
    }
})

// router.post('/admin/:user/:action', async (req, res, next) => {
//     try {
//         let dir = {
//             display: 
//         }
//     }
// }


router.use((err, req, res, next) => {
    handler(err,res);
});

module.exports = router;