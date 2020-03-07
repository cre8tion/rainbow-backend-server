const agent_id = require('./agents').agent_id;

// Load the SDK
let RainbowSDK = require('rainbow-node-sdk');

// Define your configuration
let options = {
    "rainbow": {
        "host": "sandbox", // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO
        "mode": "xmpp" // The event mode used to receive the events. Can be `xmpp` or `s2s` (default : `xmpp`)
    },

    // Rainbow developer account 
    "credentials": {
        "login": "", // Bot's login to the rainbow platform 
        "password": "" // Bot's password to the rainbow platform  
    },
    // Application identifier(rbw-cli)
    "application": {
        "appID": "", // The Rainbow Application Identifier
        "appSecret": "", // The Rainbow Application Secret
    },

    "im": {
        "sendReadReceipt": true, // If it is setted to true (default value), the 'read' receipt is sent automatically to the sender when the message is received so that the sender knows that the message as been read.
        "messageMaxLength": 1024, // the maximum size of IM messages sent. Note that this value must be under 1024.
    },

    // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.
    // Take care, severals services are linked, so disabling a service can disturb an other one.
    // By default all the services are started. Events received from server are not filtered.
    // So this feature is realy risky, and should be used with much more cautions.
    "servicesToStart": {
        "bubbles": {
            "start_up": true,
        }, //need services : 
        "telephony": {
            "start_up": true,
        }, //need services : _contacts, _bubbles, _profiles
        "channels": {
            "start_up": true,
        }, //need services :  
        "admin": {
            "start_up": true,
        }, //need services :  
        "fileServer": {
            "start_up": true,
        }, //need services : _fileStorage
        "fileStorage": {
            "start_up": true,
        }, //need services : _fileServer, _conversations
        "calllog": {
            "start_up": true,
        }, //need services :  _contacts, _profiles, _telephony
        "favorites": {
            "start_up": true,
        } //need services :  
    } // */

};



// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

rainbowSDK.events.on('rainbow_onstarted', () => {
    console.log('rainbow onstarted');
});

rainbowSDK.events.on('rainbow_onconnected', () => {
    console.log('rainbow onconnected');
});

rainbowSDK.events.on('rainbow_onready', () => {
    console.log('rainbow onready');
});

// Start the SDK
rainbowSDK.start().then(() => {
    console.log('connected');
    let ttl = 86400 // active for a day

    // TODO : Create an event listener.
    // return an anonymous account & pwd to front end.
    rainbowSDK.admin.createAnonymousGuestUser(ttl).then((guest) => {
        console.log("Hi anonymous user with Jid: " + guest['jid_im']);
        console.log("Your Account is : " + guest['loginEmail']);
        console.log("Your Password is : " + guest['password']);  

        rainbowSDK.im.sendMessageToJid("Hi anonymous user with Jid: " + guest['jid_im'], guest['jid_im']);
        rainbowSDK.im.sendMessageToJid("Your Account is : " + guest['loginEmail'], guest['jid_im']);
        rainbowSDK.im.sendMessageToJid("Your Password is : " + guest['password'], guest['jid_im']);

      
    });
    
});


rainbowSDK.events.on('rainbow_onmessagereceived', (message) => {
    console.log(message);
});