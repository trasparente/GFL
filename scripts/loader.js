// loader.js

// get data() {return { /* branch */ };},
// get team() {return { /* repo team */ };}

// fnp.user = {};
// fnp.apiCall = {};
// fnp.parent = { data: {} };

fnp.user = {
  get token() { if(localStorage.getItem( 'fnp.user.token')) return atob( localStorage.getItem( 'fnp.user.token' ) ); else return false; }
};

fnp.apiCall = function(obj){ // url, cb, err, methos, accept, data
  if(!obj.hasOwnProperty('cb')) obj.cb = function(){ console.log(this); };
  if(!obj.hasOwnProperty('url')) obj.url = fnp.repo.API;
  if(!obj.hasOwnProperty('method')) obj.method = 'GET';
  if(!obj.hasOwnProperty('accept')) obj.accept = 'application/vnd.github.v3.full+json';
  if(!obj.hasOwnProperty('data')) obj.data = null;
  if(!obj.hasOwnProperty('err')) obj.err = false;
  var xhr = new XMLHttpRequest();
  xhr.open ( obj.method, obj.url, true );
  xhr.setRequestHeader( 'Accept', obj.accept );
  if(fnp.user.token) xhr.setRequestHeader( 'Authorization', 'token ' + fnp.user.token );
  xhr.onreadystatechange = function() {
    if ( xhr.readyState == 4 && xhr.status == 200 ) {
      if (typeof obj.cb == "function") {
        if (xhr.getResponseHeader("X-RateLimit-Remaining") < 5) fnp.monitor('Rate Limit', 'exceeded');
        if (xhr.getResponseHeader("X-RateLimit-Remaining") < 2) window.location = fnp.repo.home + '/login/';
        var xrate = document.querySelector("footer > small");
        xrate.innerHTML = "X-RateLimit-Remaining: " + xhr.getResponseHeader( "X-RateLimit-Remaining" );
        obj.cb.apply( JSON.parse(xhr.responseText) );
      }
    }
    if ( xhr.readyState == 4 && xhr.status >= 400 ) {
      if(typeof obj.err == "function"){
        obj.err.apply( xhr );
      }else{
        fnp.monitor('API error', obj.url);
        console.log( xhr );
      }
    }
  };
  xhr.send( obj.data );
};

fnp.dom = {
  get summary() {return document.querySelector('header > details > summary');},
  get ul() {return document.querySelector('header > details > ul');},
  get details() {return document.querySelector('header > details');},
  setup: function(){
    this.summary.innerHTML = 'Monitor';
    this.details.setAttribute('open','');
  }
};

fnp.monitor = function (property, value) {
  var li = document.createElement( 'li' );
  li.innerHTML = property + ": " + value;
  fnp.dom.ul.appendChild( li );
};

fnp.loader = function(){
  // Setup DOM
  fnp.dom.setup();
  // Get master HEAD
  fnp.apiCall({
    url: fnp.repo.API + "/git/refs/heads/master",
    cb: function(){
      if(this){
        fnp.repo.master = this.object.sha;
        console.log('ok', this);
      }else{
        console.log('no');
      }
    }
  });
};

// loader

fnp.loader();
