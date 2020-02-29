require('dotenv').config();

let rainbowSDK_options = {
  rainbow: {
    host: "sandbox" // Using Sandbox Testing
  },
  credentials: {
    login: process.env.DEV_LOGIN,
    password: process.env.DEV_PASSWORD
  },
  // Application identifier
  application: {
    appID: process.env.APPLICATION_ID,
    appSecret: process.env.APPLICATION_SECRET
  },
  // Logs options
  logs: {
    enableConsoleLogs: true,
    enableFileLogs: false,
    "color": true,
    "level": 'debug',
    "customLabel": "inoop",
    "system-dev": {
      "internals": false,
      "http": false,
    },
    file: {
      path: "/var/tmp/rainbowsdk/",
      customFileName: "R-SDK-Node-Sample2",
      level: "debug",
      zippedArchive : false/*,
            maxSize : '10m',
            maxFiles : 10 // */
    }
  },
  // IM options
  im: {
    sendReadReceipt: true
  }
};



module.exports = {
  options: rainbowSDK_options
}
