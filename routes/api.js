import * as apiController from "../controllers/apiController";

var express = require('express');
var router = express.Router();
let RainbowSDK = require('rainbow-node-sdk');
const {options} = require('../config/config');
let rainbowSDK = new RainbowSDK(options);

rainbowSDK.start();

rainbowSDK.events.on("rainbow_onready", () => {
  // Get your network's list of contacts
  let contacts = rainbowSDK.contacts.getAll();

  for(let i = 0; i <contacts.length; i++){
      apiController.changeContactPresence(contacts[i]);
  }
});

rainbowSDK.events.on("rainbow_oncontactpresencechanged", (contact) => {
  apiController.changeContactPresence(contact);
});

/* GET guest account. */
router.get('/v1/guest_creation', async function(req, res, next) {
  try{
    let json = await apiController.generateGuestAcc(rainbowSDK);
    return res.send(json);
  }catch (e) {
    return res.status(400).send({
      "success": false,
      "message": e.message,
      "data": {}
    })
  }
});

/* POST new agent account. */
router.post('/v1/agent_creation', async function(req, res, next) {
  try{
    const {userEmailAccount, userPassword, userFirstName, userLastName} = req.body;
    const { details={} } = req.body || {};
    let user = await apiController.generateAgentAcc(rainbowSDK, userEmailAccount, userPassword, userFirstName, userLastName);
    const personalInfo = {
      "firstname" : userFirstName,
      "lastname" : userLastName,
      "email" : userEmailAccount
    };
    let json = await apiController.saveNewAgentToDB(user, personalInfo, details);

    return res.send(json);
  }catch (e) {
    return res.status(400).send({
      "success": false,
      "message": e.message,
      "data": {}
    })
  }
});

router.post('/v1/delete_agent', async function(req, res, next) {
  try{
    const { userId } = req.body;
    let result = await apiController.deleteAgentFromRainbow(rainbowSDK, userId);
    if(result === true){
      console.log("Deleted Agent from rainbow");
      let json = await apiController.deleteAgentFromDB(userId);
      return res.send(json);
    }
    else{
      return res.status(400).send({
        "success": false,
        "message": `Deleting agent from rainbow has resulted in an unexpected error`,
        "data": {}
      })
    }
  } catch (e) {
    return res.status(400).send({
      "success": false,
      "message": e.message,
      "data": {}
    })
  }
});


router.post('/v1/update_agent', async function(req, res, next) {
  try{
    let json = await apiController.updateAgentFromDB(req.body);
    return res.send(json);
  } catch (e){
    return res.status(400).send({
      "success": false,
      "message": e.message,
      "data": {}
    });
  }
});

module.exports = router;
