const express = require('express');
// const {agentInfo, joinAllTables, queryLanguage, querySkills,} = require('../db');
import db from '../db';
const {responseHandler, errorHandler, ErrorHolder, DefaultError, SuccessHolder} = require('./errorHandle');

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
        res.locals.results = new SuccessHolder(results);
        next();
        // res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

router.get('/all', async (req, res, next) => {
    try {
        let results = await db.joinAllTables();
        res.locals.results = new SuccessHolder(results);
        next();
        
        // res.json(results);
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
        if (jsonToSend != null) {
            res.locals.results = new SuccessHolder(results);
            next();
            // res.json(jsonToSend);
        }
        else next(new ErrorHolder(404,"rainbow_id " + req.params.rainbow_id + " does not exits."));
    } catch(e) {
        console.log(e);
        let error = new DefaultError();
        next(error);
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
        await db.initialiseAgentDetails(rainbow_id, details);
        res.locals.results = new SuccessHolder();
        next();

        // res.json(results);      // TODO: We should be returning something else
    } catch(e) {
        console.log(e);
        let error = new ErrorHolder(400, e.sqlMessage);
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

        await db.updateAgentDetails(toBeChangedJson);
        res.locals.results = new SuccessHolder();
        next();


        // res.json(results);      // TODO: We should be returning something else


    } catch(e) {
        console.log(e);
        let error = new ErrorHolder(400, e.sqlMessage);
        next(error);
    }
});

router.delete('/delete/agent/:rainbow_id', async (req, res, next) => {
    try {
        let rainbow_id = req.params.rainbow_id;
        let results = await db.deleteAgent(rainbow_id);
        res.locals.results = new SuccessHolder();
        next();

        // res.json(results);      // TODO: We should be returning something else
    } catch(e) {
        console.log(e);
        let error = new ErrorHolder(400, e.sqlMessage);
        next(error);
    }
});

/* SUCCESS RESPONSE HANDLING */
router.use((req, res, next) => {
    responseHandler(res.locals.results, res);
});

/* ERROR HANDLING */
router.use((err, req, res, next) => {
    errorHandler(err,res);
});

module.exports = router;
