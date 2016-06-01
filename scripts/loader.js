// loader.js

var userLogged = false,
userToken = false;

if (localStorage.getItem('userToken')) userToken = localStorage.getItem('userToken');

function apiFirstCall(obj){
  obj.method = 'GET';
  obj.accept = 'application/vnd.github.v3.full+json';
  var xhr = new XMLHttpRequest();
  xhr.open ( obj.method, obj.url, true );
  xhr.setRequestHeader( 'Accept', obj.accept );
  if(userToken && atob(userToken)){
    xhr.setRequestHeader( 'Authorization', 'token ' + atob(userToken) );
    userLogged = true;
  }else userLogged = false;
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4){
      document.body.classList.remove('request');
      if ( xhr.status == 200 ||  xhr.status == 201 ||  xhr.status == 204 ) {
        if (typeof obj.cb == 'function') {
          obj.cb.apply(JSON.parse(xhr.responseText));
        }
      }
      if ( xhr.status >= 400 ) {
        console.log( xhr );
        if(xhr.status == 401) userLogged = false;
        domAppend({ tag: 'script', parent: 'body', attributes: { src: rawgitUrl('master') + '/scripts/updater.js', type: 'text/javascript' } });
      }
    }
  };
  document.body.classList.add('request');
  xhr.send();
}

function headMaster(){
  apiFirstCall({
    url: repoAPI + "/git/refs/heads/master",
    cb: function(){
      sessionStorage.setItem('masterRef', this.object.sha);
      domAppend({ tag: 'script', parent: 'body', attributes: { src: rawgitUrl('master') + '/scripts/updater.js', type: 'text/javascript' } });
    },
    err: function(){
      sessionStorage.setItem('masterRef', 'master');
    }
  });
}

// loader
headMaster();
