(function(){
    var btnSignUp = document.getElementById('loginBtn');
    var btnLogout = document.getElementById('logoutBtn');
    var btnJoin = document.getElementById('joinBtn');

    firebase.auth().onAuthStateChanged(firebaseUser =>{

        if(firebaseUser){
          alert("login ok");
          console.log(firebaseUser);
            
        }else{
          alert("login false");
          console.log('not logged in');          
        }
    });
})()