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

router.get('/all/:keyTerm', async (req, res, next) => {

    try{
        let results = await db.query(req.params.keyTerm);
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.get('/all', async (req, res, next) => {
    try {
        let results = await db.joinAllTables();
        res.json(results);
    } catch(e) {
        console.log(e);
        next(new DefaultError());
    }
})




/* ADMINISTRATIVE FUNCTIONS:
* VIEW AGENT
* ADD AGENT
* UPDATE AGENT
* DELETE AGENT
*/

/* VIEW SINGLE AGENT */
router.get('/agent/:rainbow_id', async (req, res, next) => {
    try {
        let results = await db.joinAllTables();
        let jsonToSend;
        for(var i = 0; i < results.length; i++) {
            if (req.params.rainbow_id === results[i].agent_id) {
                jsonToSend = results[i]
                break;
            }
        }
        if (jsonToSend != null) res.json(jsonToSend);
        else next(new ErrorHandler(404,"rainbow_id " + req.params.rainbow_id + " does not exits."));
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

/* ADD SINGLE AGENT
 * Request body JSON example
    {
        "rainbow_id": "fake_rainbow_id4",
        "name": "Jacob Wijaya",
        "details": {
            "languages": {
                "english": 1,
                "chinese": 0,
                "malay": 0
            },
            "skills": {
                "insurance": 1,
                "bank statement": 1,
                "fraud": 1
            }
        }
    }
    */
router.post('/add', async (req, res, next) => {
    try {
        let rainbow_id = req.body.rainbow_id;
        let personalInfo = req.body.personalInfo;
        let details = req.body.details;

        // Create agent's record
        await db.addAgent(rainbow_id, personalInfo);
        // To initialise the Agent's languages and skills to be 0 if not specified in details JSON
        let results = await db.initialiseAgentDetails(rainbow_id, details);

        res.json(results);      // TODO: We should be returning something else
    } catch(e) {
        console.log(e);
        let error = new ErrorHandler(400, e.sqlMessage);
        next(error);
    }
})


/* UPDATE SINGLE AGENT
 * Request Body JSON example (All except rainbow_id are optional)
    {
    "rainbow_id": "fake_rainbow_id4",
    "name": "Jacob Wijaya",
    "details": {
    	"languages": {
    		"english": 1,
    		"chinese": 0,
    		"malay": 0
    	},
    	"skills": {
    		"insurance": 1,
    		"bank statement": 1,
    		"fraud": 1
    	}
    }
}
*/
router.put('/update', async (req, res, next) => {
    try {
        let toBeChangedJson = req.body;

        let results = await db.updateAgentDetails(toBeChangedJson);


        res.json(results);      // TODO: We should be returning something else


    } catch(e) {
        console.log(e);
        let error = new ErrorHandler(400, e.sqlMessage);
        next(error);
    }
});

router.delete('/delete/agent/:rainbow_id', async (req, res, next) => {
    try {
        let rainbow_id = req.params.rainbow_id;
        let results = await db.deleteAgent(rainbow_id);

        res.json(results);      // TODO: We should be returning something else
    } catch(e) {
        console.log(e);
        let error = new ErrorHandler(400, e.sqlMessage);
        next(error);
    }
});


router.use((err, req, res, next) => {
    handler(err,res);
});

module.exports = router;
