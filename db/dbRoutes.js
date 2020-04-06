const express = require('express');
import db from '../db';
const {successHandler, errorHandler, DefaultError} = require('./errorHandle');

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
        successHandler(res, results, "success");
    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
});

router.get('/all', async (req, res, next) => {
    try {
        let results = await db.joinAllTables();
        successHandler(res, results, "success");
    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
})

/* AVAILABILITY METHODS */
router.put('/agent/:rainbow_id/availability/:availability', async(req, res, next) => {
    try {
        await db.changeAvailability(req.params.rainbow_id, req.params.availability);
        successHandler(res);
    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
});

/* ROUTING ENGINE */

router.get('/route/:filters', async(req, res, next) => {
    try {
        let filters = req.params.filters;
        let filterArray = filters.split('+');
        
        let results = await db.routeForAgent(filterArray);
        successHandler(res, results, "success");
        
    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
})

router.get('/route/', async(req, res, next) => {
    try {
        let filterArray = [];
        
        let results = await db.routeForAgent(filterArray);
        successHandler(res, results, "success");
    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
})

/* FEEDBACK ENDPOINT */

router.put('/agent/:rainbow_id/rating/:rating', async(req, res, next) => {
    try {
        let rainbow_id = req.params.rainbow_id;
        let rating = req.params.rating;

        let results = await db.rateAgent(rainbow_id, rating);
        successHandler(res, results, "success");
    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
});


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
        var jsonToSend;
        for(var i = 0; i < results.length; i++) {
            if (req.params.rainbow_id === results[i].agent_id) {
                jsonToSend = results[i]
                break;
            }
        }
        if (jsonToSend != null) {
            successHandler(res, jsonToSend, "success");
        }
        else next(new DefaultError("rainbow_id " + req.params.rainbow_id + " does not exits."));
    } catch(e) {
        console.log(e);
        let error = new DefaultError(e);
        next(error);
    }
});

/* ADD SINGLE AGENT
 * Request body JSON example
    {
        "rainbow_id": "fake_rainbow_id4",
        "personalInfo": {
            "firstname": "Le",
            "lastname": "Xuan",
            "email": "lexuan@gmail.com"
        },
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
        successHandler(res);

    } catch(e) {
        console.log(e);
        let error = new DefaultError(e);
        next(error);
    }
})


/* UPDATE SINGLE AGENT
 * Request Body JSON example (All except rainbow_id are optional)
    {
    "rainbow_id": "fake_rainbow_id4",
    "personalInfo": {
    	"firstname": "Le",
    	"lastname": "Xuan",
    	"email": "lexuan@gmail.com"
    },
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
        successHandler(res);

    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
});

router.delete('/delete/agent/:rainbow_id', async (req, res, next) => {
    try {
        let rainbow_id = req.params.rainbow_id;
        let response = await db.deleteAgent(rainbow_id);
        successHandler(res);

    } catch(e) {
        console.log(e);
        next(new DefaultError(e));
    }
});

/* ERROR HANDLING MIDDLEWARE */
router.use((err, req, res, next) => {
    errorHandler(err,res);
});

module.exports = router;
