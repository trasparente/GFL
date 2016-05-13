// loader.js

fnp.user = {
  get token() { if(localStorage.getItem( 'fnp.user.token')) return atob( localStorage.getItem( 'fnp.user.token' ) ); else return false; }
};

fnp.apiCall = function(obj){
  if(!obj.hasOwnProperty('cb')) obj.cb = function(){ console.log(this); };
  if(!obj.hasOwnProperty('url')) obj.url = fnp.repo.API;
  if(!obj.hasOwnProperty('method')) obj.method = 'GET';
  if(!obj.hasOwnProperty('accept')) obj.accept = 'application/vnd.github.v3.full+json';
  if(!obj.hasOwnProperty('data')) obj.data = null;
  if(!obj.hasOwnProperty('err')) obj.err = false;
  obj.etag = 'fnp.etag.' + obj.url.replace(/\W+/g, "");
  var xhr = new XMLHttpRequest();
  xhr.open ( obj.method, obj.url, true );
  xhr.setRequestHeader( 'Accept', obj.accept );
  if(fnp.user.token) xhr.setRequestHeader( 'Authorization', 'token ' + fnp.user.token );
  if(localStorage.getItem(obj.etag)) xhr.setRequestHeader('If-None-Match', localStorage.getItem(obj.etag));
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4){
      document.querySelector('body').style.backgroundColor = "white";
      if(xhr.getResponseHeader('ETag') && obj.url.indexOf('ref=') == -1 ){
        var etag = RegExp(/W\/"(.*?)"/).exec(xhr.getResponseHeader('ETag'));
        if(etag) localStorage.setItem(obj.etag, etag[1]);
      }
      if ( xhr.status == 200 ||  xhr.status == 201 ||  xhr.status == 204 ) {
        if (typeof obj.cb == 'function') {
          if (xhr.getResponseHeader('X-RateLimit-Remaining') < 5) fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'rate limit: exceeded' });
          if (xhr.getResponseHeader('X-RateLimit-Remaining') < 2) window.location = fnp.repo.home + '/login/';
          var xrate = document.querySelector('footer > small');
          xrate.innerHTML = 'X-RateLimit-Remaining: ' + xhr.getResponseHeader( 'X-RateLimit-Remaining' );
          var response = (obj.accept.indexOf('json') > -1) ? JSON.parse(xhr.responseText) : xhr.responseText;
          obj.cb.apply(response);
        }
      }
      if ( xhr.status >= 400 ) {
        if(typeof obj.err == 'function'){
          obj.err.apply( xhr );
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'api error: ' + obj.url });
          console.log( xhr );
        }
      }
    }
  };
  document.querySelector('body').style.backgroundColor = 'whitesmoke';
  xhr.send( obj.data );
};

fnp.getMasterHead = function(){
  fnp.apiCall({
    url: fnp.repo.API + "/git/refs/heads/master",
    cb: function(){
      fnp.repo.master = (fnp.repo.master != 'master') ? fnp.repo.master : this.object.sha;
      fnp.appendi({ tag: 'script', parent: 'body', attributes: { src: fnp.repo.rawgit + '/scripts/updater.js', type: 'text/javascript' } });
    }
  });
};

// loader

fnp.getMasterHead();
