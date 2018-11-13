var firebase = require("firebase");

var config = {
    ...
  };

firebase.initializeApp(config);

global.firebase = firebase;
global.firebaseAuth = firebase.auth();