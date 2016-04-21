var user = {},
  apiCall = {},
  parent = {};

//
// GFL
//
var gfl = {
  start: function(){
    apiCall.accept = 'application/vnd.github.v3.full+json';
    apiCall.method = 'GET';
    if ( localStorage.getItem( 'gfl.user.token' ) ) return this.getThisRepo(); else return this.login();
  },
  getThisRepo: function(){
    user.token = atob( localStorage.getItem( 'gfl.user.token' ) );
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name;
    apiCall.cb = function(){
      repo.content = JSON.parse( this.responseText );
      document.getElementById( "logged" ).style.display = "block";

      // ORGANIZATION
      if( repo.content.owner.type == "Organization" ){
        monitor( "game started", repo.content.created_at );
        monitor( "players", repo.content.forks );
        if(repo.content.permissions.admin === true){
          // GM connected
          gfl.gmConnected();
        }else{
          // Guest player
          gfl.guestConnected();
        }
      }

      // PLAYER
      if( repo.content.owner.type == "User" ){
        if( repo.content.permissions.admin === true ){
          gfl.playerConnected();
        }else{
          // Player in wrong page
          gfl.guestConnected();
          // monitor("You don&apos;t own this repository", "<a href='" + repo.content.parent.html_url + "'>fork</a> your own copy");
        }
      }

      return "check ownership";
    };
    apiCall.err = function(){
      console.log(this.responseText);
    };
    apiCall.call();
    return "called repo";
  },
  login: function(){
    // LOGIN
    document.getElementById( "login" ).style.display = "block";
    document.getElementById( "submitLogin" ).addEventListener('click', function(e) {
      e.preventDefault();
      user.token = document.getElementById( "token" ).value;
      document.getElementById( "token" ).value = '';
      if (user.token) {
        document.getElementById( "submitLogin" ).setAttribute("disabled", "true");
        apiCall.url = "https://api.github.com";
        apiCall.cb = function(){
          localStorage.setItem("gfl.user.token", btoa(user.token));
          appendi('p', 'form', "Authorized. <a href='" + repo.home + "'>Proceed</a>");
        };
        apiCall.err = function(){
          appendi('p', 'form', "Wrong token, retry.");
          document.getElementById('submitLogin').removeAttribute("disabled");
          document.getElementById("token").value = '';
          document.getElementById("token").focus();
        };
        apiCall.call();
      }
    });
    return "waiting login";
  },
  gmConnected: function(){
    apiCall.url += "/pulls";
    apiCall.cb = function(){
      repo.pulls = JSON.parse( this.responseText );
      if( repo.pulls.length !== 0 ){
        monitor( "pending pulls", "<a href='" + repo.content.html_url + "/pulls'>" + repo.pull.length + ' pulls</a>' );
      }else{
        monitor( "pending pulls", "no pulls" );
      }
      // url = "https://api.github.com/repos/" + username + "/" + reponame + "/contents/schema/settings.json";
      // getAPI( url, gmSettings, gmNosettings, '{"ref":"master"}' );
    };
    apiCall.err = function(){
      console.log(this.responseText);
    };
    apiCall.call();
  },
  guestConnected: function(){
    console.log("guest connected");
  },
  playerConnected: function(){
    monitor( "game started", repo.content.parent.created_at );
    monitor( "players", repo.content.parent.forks );
    monitor( "joined game", repo.content.created_at );
    // Player connected
    apiCall.url = "https://api.github.com/repos/" + repo.content.parent.full_name + "/git/refs/heads/master";
    apiCall.cb = function(){
      parent.ref = JSON.parse( this.responseText );
      monitor( 'forked from', '<a href="http://' + repo.content.parent.owner.login + '.github.io/' + repo.content.parent.name + '">' + repo.content.parent.owner.login + '/' + repo.content.parent.name + '</a>' );
      monitor( 'parent version', parent.ref.object.sha );
      gfl.checkSHA();
    };
    apiCall.err = function(){
      console.log(this.responseText);
    };
    apiCall.call();
    // url = "https://api.github.com/repos/" + systemRepositoryName + "/git/refs/heads/master";
    // getAPI( url, systemRef, error, {} );
  },
  checkSHA: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/git/refs/heads/master";
    apiCall.cb = function(){
      repo.ref = JSON.parse( this.responseText );
      if( repo.ref.object.sha == parent.ref.object.sha ){
        monitor( 'version', repo.ref.object.sha );
        // checkSettings();
      }else{
        monitor( 'version', 'need update from ' + repo.ref.object.sha );
        gfl.update();
        // update();
      }
    };
    apiCall.call();
    // getAPI( url, playerRef, error, {} );
  },
  update: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/git/refs/heads/master";
    apiCall.accept = 'application/vnd.github.v3.patch';
    apiCall.method = 'PATCH';
    apiCall.data = '{"sha":"' + parent.ref.object.sha + '"}';
    apiCall.cb = function(){
      gfl.checkSHA();
    };
    apiCall.call();
  }
};

//
// API CALL
//
apiCall.call = function(){
  var xhr = new XMLHttpRequest();
  xhr.open ( apiCall.method, apiCall.url, true );
  xhr.setRequestHeader( 'Accept', apiCall.accept );
  xhr.setRequestHeader( 'Authorization', 'token ' + user.token );
  xhr.onreadystatechange = function() {
    if ( xhr.readyState == 4 && xhr.status == 200 ) {
      if (typeof apiCall.cb == "function") {
        var xrate = document.querySelector("footer > small");
        xrate.innerHTML = "X-RateLimit-Remaining: " + xhr.getResponseHeader( "X-RateLimit-Remaining" );
        // document.querySelector( 'footer' ).appendChild(xrate);
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

function appendi( what, after, text){
  var ele = document.createElement(what);
  ele.innerHTML = text;
  document.querySelector(after).appendChild(ele);
}

//
// START
//
var start = gfl.start();
