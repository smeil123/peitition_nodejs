var express = require('express');
var router = express.Router();

router.get('/login',function(req,res){
  res.render('userLogin');
});

router.post('/login',function(req,res){

    const Email = req.body.email;
    const Password = req.body.password;

    console.log(Email);

    firebase.auth().signInWithEmailAndPassword(Email, Password).then(function() {
        // Handle Errors here.
        firebase.auth().onAuthStateChanged(function(user){
          if (user) {
            // User is signed in.
            req.session.uid = user.uid;
            req.session.email = user.email;
            // req.session.name = user.displayName;
            // req.session.emailVerified = user.emailVerified;

            req.session.save(function(err){
              if(err){
                console.log(err);
              }else{
                res.redirect('/boards');
              }
            });
          } else {
            // No user is signed in.
            res.send('<script type="text/javascript">alert("' + '로그인에 실패했습니다' + '");window.location.href = "/users/login";</script>');
          }
        });

      }).catch(function (error){

        var errorCode = error.code;
        var errorMessage = error.message;
        
        console.log(errorMessage);
        res.send('<script type="text/javascript">alert("' + errorMessage + '");window.location.href = "/users/login";</script>');

    });
});

router.get('/join',function(req,res){
  res.render('userJoin',{errorMessage:"",errorCnt:0})
});

router.post('/join',function(req,res){
  const Email = req.body.signupEmail;
  const Password = req.body.signupPassword;

  console.log(Email);

  firebase.auth().createUserWithEmailAndPassword(Email, Password).then(function() {
    res.redirect('/users/login');
  }).catch(function(error){

    var errorCode = error.code;
    var errorMessage = error.message;
    
    console.log(errorMessage);
    res.send('<script type="text/javascript">alert("' + errorMessage + '");window.location.href = "/users/join";</script>');

  });
});

router.get('/logout',function(req,res){
  var sess = req.session;
  if(sess.uid){
    console.log(sess.uid);

    req.session.destroy(function(err){
      if(err){
        console.log(err);
      }
      else{
        firebase.auth().signOut();
        res.redirect('/boards');
      }
    })
  }
  else{
    console.log("not login");
    res.redirect('/boards');
  }
});

module.exports = router;
