var eleToken = document.getElementById( 'token' ),
    eleSubmit = document.getElementById( 'submitLogin' );

eleSubmit.addEventListener('click', function(e) {
  e.preventDefault();
  var token = eleToken.value;
  eleToken.value = '';
  if (token) {
    eleSubmit.setAttribute('disabled', 'true');
    apiCall({
      url: 'https://api.github.com',
      cb: function(){
        localStorage.setItem('userToken', btoa(token));
        domAppend({ tag: 'li', parent: domSection, innerHTML: 'logged: <a href="' + repoHome + '">proceed</a>' });
      },
      err: function(){
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'error: wrong token, try again' });
        eleSubmit.removeAttribute('disabled');
        eleToken.value = '';
        eleToken.focus();
      }
    });
  }
});
