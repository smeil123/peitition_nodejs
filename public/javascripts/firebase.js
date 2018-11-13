var app_fireBase = {};
(function(){
    // Initialize Firebase
    // TODO: Replace with your project's customized code snippet
    var config = {
      apiKey: "AIzaSyA2m6oG0N4XHW-OpKMk0_2AlEnDr80CAxE",
      authDomain: "uos-student-petition.firebaseapp.com",
      databaseURL: "https://uos-student-petition.firebaseio.com",
      projectId: "uos-student-petition",
      storageBucket: "uos-student-petition.appspot.com",
      messagingSenderId: "931159932333"
    };
    firebase.initializeApp(config);
    app_fireBase = firebase;
  })()
