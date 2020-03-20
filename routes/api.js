import db from "../db";

var express = require('express');
var router = express.Router();
let RainbowSDK = require('rainbow-node-sdk');
const {options} = require('../config/config');
let rainbowSDK = new RainbowSDK(options);

rainbowSDK.start();

rainbowSDK.events.on("rainbow_oncontactpresencechanged", (contact) => {
  /*
  CONTACT OBJECT
   {
      "displayName": 'Robert Doe',
      "companyName": 'A company',
      "loginEmail": 'rdoe@acompany.com',
      "nickName": 'rdoe',
      "title": 'Dr',
      "jobTitle": 'CEO',
      "country": 'USA',
      "timezone": 'America/Los_Angeles',
      "companyId": '5805e150383b2852d37a9e64',
      "jid_im": '8e59c1b6661641968d59e901bf8bb1ea@sandbox-all-in-one-prod-1.opentouch.cloud',
      "jid_tel": 'tel_8e59c1b6661641968d59e901bf8bb1ea@sandbox-all-in-one-prod-1.opentouch.cloud',
      "lastAvatarUpdateDate": '2016-11-04T19:34:29.292Z',
      "lastUpdateDate": '2017-09-18T11:57:31.695Z',
      "adminType": 'undefined',
      "roles": [ 'user', 'admin' ],
      "phoneNumbers": [],
      "emails": [ { "email": 'rdoe@acompany.com', "type": 'work' } ],
      "lastName": 'Doe',
      "firstName": 'Robert',
      "isTerminated": false,
      "language": 'en',
      "id": '581b405d383b2852d37aa098',
      "resources": {
          'web_win_1.29.3_NOOILjkW': {
              "priority": '5',
              "show": 'away',
              "delay": '',
              "status": '',
              "type": 'desktopOrWeb'
          }
      },
      "presence": 'online',
      "status": ''
  }
   */

  // Update contact about its availability
  // Awaiting for DB function to be created.


});

/* GET guest account. */
router.get('/v1/guest_creation', async function(req, res, next) {
  try{
    let json = await generateGuestAcc();
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
    const { details } = req.body || {};
    let user = await generateAgentAcc(userEmailAccount, userPassword, userFirstName, userLastName);
    // reformat user object
    let json = await saveNewAgentToDB(user, details);

    return res.send(json);
  }catch (e) {
    return res.status(400).send({
      "success": false,
      "message": e.message,
      "data": {}
    })
  }
});


async function generateGuestAcc(){
  try{
    let guest = await rainbowSDK.admin.createAnonymousGuestUser(86400);
    console.log("New anonymous user with Jid: " + guest['jid_im']);
    console.log("Your Account is : " + guest['loginEmail']);
    console.log("Your Password is : " + guest['password']);
    //console.log(guest);

    //rainbowSDK.im.sendMessageToJid("Hi anonymous user with Jid: " + guest['jid_im'], guest['jid_im']);
    //rainbowSDK.im.sendMessageToJid("Your Account is : " + guest['loginEmail'], guest['jid_im']);
    //rainbowSDK.im.sendMessageToJid("Your Password is : " + guest['password'], guest['jid_im']);
    return {
      "success": true,
      "message": "Guest Account generated successfully",
      "data": {username: guest['loginEmail'], password: guest['password']}
    }
  } catch (e) {
    console.log(e);
    throw new Error("Guest Account Creation Failed");
  }
}

async function generateAgentAcc(userEmailAccount, userPassword, userFirstName, userLastName){
  try {
    let user = await rainbowSDK.admin.createUserInCompany(userEmailAccount, userPassword, userFirstName, userLastName);
    console.log(user);
    return user;

  } catch (e) {
    console.log(e);
    throw new Error("Agent Account Creation Failed");
  }
}

async function saveNewAgentToDB(user, details){
  try{
    await db.addAgent(user.id, user.displayName);
    await db.initialiseAgentDetails(user.id, details);

    return {
      "success": true,
      "message": "Agent Account generated successfully",
      "data": {}
    }
  } catch (e) {
    console.log(e);
    throw new Error("Agent Account Update to DB Failed");
  }
}



module.exports = router;
