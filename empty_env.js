let options;

/**
 * This empty env file serves as a template to make env.js file with your own credentials
 * DO NOT COMMIT YOUR env.js file after doing so
 */

export default options = {
  rainbow: {
    host: "sandbox" // Using Sandbox Testing
  },
  credentials: {
    login: "", // To replace by your developer credendials
    password: "" // To replace by your developer credentials
  },
  // Application identifier
  application: {
    appID: "", // To replace by your application ID
    appSecret: "" // To replace by your application secret
  },
  // Logs options
  logs: {
    enableConsoleLogs: true,
    enableFileLogs: false,
    "color": true,
    "level": 'debug',
    "customLabel": "vincent01",
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
