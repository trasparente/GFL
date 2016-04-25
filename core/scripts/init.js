// init.js

var user = {},
  apiCall = {},
  parent = {};

var gfl = {
  start: function(){
    if(localStorage.getItem( 'gfl.user.token')) user.token = atob( localStorage.getItem( 'gfl.user.token' ) );
    if(!url.page) url.script='home'; else url.script=url.page;
    apiCall.accept = 'application/vnd.github.v3.full+json';
    apiCall.method = 'GET';
    apiCall.data = '';
    apiCall.url = repo.API + "/git/refs/heads/master";
    apiCall.cb = function(){
      repo.ref = JSON.parse( this.responseText );
      repo.sha = repo.ref.object.sha;
      gfl.getThisRepo();
    };
    apiCall.err = function(){
      monitor( 'SHA', 'no SHA' );
      gfl.getThisRepo();
    };
    apiCall.call();
  },
  getThisRepo: function(){
    apiCall.url = repo.API;
    apiCall.cb = function(){
      repo.content = JSON.parse( this.responseText );
      // ORGANIZATION
      if( repo.content.owner.type == "Organization" ){
        repo.type = 'org';
        monitor( "game started", repo.content.created_at );
        monitor( "players", repo.content.forks );
        if(repo.content.permissions.admin === true){
          user.type = 'owner';
        }else{
          user.type = 'guest';
        }
      }
      // PLAYER
      if( repo.content.owner.type == "User" ){
        repo.type = 'usr';
        if(repo.content.fork){
          monitor( "game started", repo.content.parent.created_at );
          monitor( "players", repo.content.parent.forks );
          if( repo.content.permissions.admin === true ){
            user.type = 'owner';
          }else{
            user.type = 'guest';
          }
          monitor( "joined game", repo.content.created_at );
        }else{
          monitor( "error","user repo is not a fork");
        }
      }
      gfl.loadScript();
    };
    apiCall.err = function(){
      repo.type = 'usr';
      user.type = 'guest';
      // Bad credentials, revoked token
      user.token = '';
      localStorage.removeItem("gfl.user.token");
      gfl.loadScript();
    };
    apiCall.call();
  },
  loadScript: function(){
    var script = document.createElement("script");
    var file = url.script + '.js';
    if(repo.sha) script.src = repo.static + repo.sha + '/core/scripts/' + file; else script.src = repo.static + 'master/core/scripts/' + file;
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }
};

// API CALL
apiCall.call = function(){
  var xhr = new XMLHttpRequest();
  xhr.open ( apiCall.method, apiCall.url, true );
  xhr.setRequestHeader( 'Accept', apiCall.accept );
  if(user.token)xhr.setRequestHeader( 'Authorization', 'token ' + user.token );
  xhr.onreadystatechange = function() {
    if ( xhr.readyState == 4 && xhr.status == 200 ) {
      if (typeof apiCall.cb == "function") {
        if (xhr.getResponseHeader("X-RateLimit-Remaining") < 5) monitor('Rate Limit', 'exceeded');
        if (xhr.getResponseHeader("X-RateLimit-Remaining") < 2) window.location = repo.home + '/login/';
        var xrate = document.querySelector("footer > small");
        xrate.innerHTML = "X-RateLimit-Remaining: " + xhr.getResponseHeader( "X-RateLimit-Remaining" );
        apiCall.cb.apply( xhr );
      }
    }
    if ( xhr.readyState == 4 && xhr.status >= 400 ) {
      if ( typeof apiCall.err == "function" ) {
        apiCall.err.apply( xhr );
      }
    }
  };
  xhr.send( apiCall.data );
};

function monitor( name, data ){
  var listItem = document.createElement( 'li' );
  listItem.innerHTML = name + ": " + data;
  document.getElementById( "monitor" ).appendChild( listItem );
}


// START
var start = gfl.start();
