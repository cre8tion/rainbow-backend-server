const express = require('express');
const {agentInfo, joinAllTables, queryLanguage, querySkillset} = require('../db');

const router = express.Router();

/* RETRIEVE ALL INFO */
router.get('/test:p', async (req, res, next) => {
    const di = {
        1: agentInfo,
        2: joinAllTables
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

router.get('/querySkillset/:keyTerm', async (req, res, next) => {

    try{
        let results = await querySkillset(req.params.keyTerm);
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.get('/queryLanguage/:keyTerm', async (req, res, next) => {

    try{
        let results = await queryLanguage(req.params.keyTerm);
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});


module.exports = router;