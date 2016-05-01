// loader.js

// get data() {return { /* branch */ };},
// get team() {return { /* repo team */ };}

// fnp.user = {};
// fnp.apiCall = {};
// fnp.parent = { data: {} };

fnp.user = {
  get token() { if(localStorage.getItem( 'fnp.user.token')) return atob( localStorage.getItem( 'fnp.user.token' ) ); else return false; }
};

fnp.apiCall = function(url, cb){
  var method = 'GET', accept = 'application/vnd.github.v3.full+json';
  if(argument[2]) method = argument[2];
  if(argument[3]) accept = argument[3];
  var xhr = new XMLHttpRequest();
  xhr.open ( method, url, true );
  xhr.setRequestHeader( 'Accept', accept );
  if(fnp.user.token) xhr.setRequestHeader( 'Authorization', 'token ' + fnp.user.token );
  xhr.onreadystatechange = function() {
    if ( xhr.readyState == 4 && xhr.status == 200 ) {
      if (typeof cb == "function") {
        if (xhr.getResponseHeader("X-RateLimit-Remaining") < 5) fnp.monitor('Rate Limit', 'exceeded');
        if (xhr.getResponseHeader("X-RateLimit-Remaining") < 2) window.location = fnp.repo.home + '/login/';
        var xrate = document.querySelector("footer > small");
        xrate.innerHTML = "X-RateLimit-Remaining: " + xhr.getResponseHeader( "X-RateLimit-Remaining" );
        cb.apply( xhr );
      }
    }
    if ( xhr.readyState == 4 && xhr.status >= 400 ) {
        fnp.monitor('error', 'API call error, check console.');
        console.log( xhr );
    }
  };
  xhr.send( apiCall.data );
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
  this.dom.setup();
  this.apiCall( fnp.repo.API, function(){
    if(resp){
      console.log('ok');
    }else{
      console.log('no');
    }
  });
};

// loader

fnp.loader();
