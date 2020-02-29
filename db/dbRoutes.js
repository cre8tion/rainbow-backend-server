const express = require('express');
const {test1} = require('../db');

const router = express.Router();

router.get('/test:p', async (req, res, next) => {
    const di = {
        1: test1,
        // 2: test2
    }

    try{
        let func = di[req.params.p];
        let results = await func.all();
        res.json(results);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});


module.exports = router;