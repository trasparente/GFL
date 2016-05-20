document.getElementById( 'submitLogin' ).addEventListener('click', function(e) {
  e.preventDefault();
  var token = document.getElementById( 'token' ).value;
  document.getElementById( 'token' ).value = '';
  if (token) {
    document.getElementById( 'submitLogin' ).setAttribute('disabled', 'true');
    fnp.apiFirstCall({
      url: 'https://api.github.com',
      cb: function(){
        localStorage.setItem('fnp.user.token', btoa(token));
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'logged: <a href="' + fnp.repo.home + '">proceed</a>' });
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'error: wrong token, try again' });
        document.getElementById('submitLogin').removeAttribute('disabled');
        document.getElementById('token').value = '';
        document.getElementById('token').focus();
      }
    });
  }
});
