document.getElementById( "submitLogin" ).addEventListener('click', function(e) {
  e.preventDefault();
  fnp.user.token = document.getElementById( "token" ).value;
  document.getElementById( "token" ).value = '';
  if (fnp.user.token) {
    document.getElementById( "submitLogin" ).setAttribute("disabled", "true");
    fnp.apiCall( "https://api.github.com", fnp.repo.API, function(){
      localStorage.setItem("fnp.user.token", btoa(user.token));
      window.location = repo.home;
    });

    apiCall.url = "https://api.github.com";
    apiCall.cb = function(){
      localStorage.setItem("fnp.user.token", btoa(user.token));
      window.location = repo.home;
    };
    apiCall.err = function(){
      monitor("error","wrong token, try again");
      document.getElementById('submitLogin').removeAttribute("disabled");
      document.getElementById("token").value = '';
      document.getElementById("token").focus();
    };
    apiCall.call();
  }
});

this.apiCall( fnp.repo.API, function(){
  if(resp){
    console.log('ok');
  }else{
    console.log('no');
  }
});
