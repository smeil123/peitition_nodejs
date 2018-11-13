function join(){
    //이메일 체크해줘야함
    const txtEmail = document.getElementById('signupEmail');
    const txtPassword = document.getElementById('signupPassword');

    var email =txtEmail.value;
    var pass = txtPassword.value;

    //Sign in
    //이메일과 비밀번호는 모아서 firebase인증으로 보낸다
    //사용자가 있으면 로그인된다
    const promise = firebase.auth().createUserWithEmailAndPassword(email,pass);
    promise.catch(e=> console.log(e.message));
    // $('#joinform').submit();

}
