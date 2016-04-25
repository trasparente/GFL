document.getElementById( "submitLogin" ).addEventListener('click', function(e) {
  e.preventDefault();
  user.token = document.getElementById( "token" ).value;
  document.getElementById( "token" ).value = '';
  if (user.token) {
    document.getElementById( "submitLogin" ).setAttribute("disabled", "true");
    apiCall.url = "https://api.github.com";
    apiCall.cb = function(){
      localStorage.setItem("gfl.user.token", btoa(user.token));
      monitor("logged","<a href='" + repo.home + "'>Proceed</a>");
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
