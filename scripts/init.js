// init.js

var user = {},
  apiCall = {},
  parent = { data: {} },
  dom = {};

var fnp = {
  start: function(){
    dom.summary = document.createElement('summary');
    dom.summary.innerHTML = 'Monitor';
    dom.monitor = document.createElement('ul');
    dom.details = document.createElement('details');
    dom.details.setAttribute('open','');
    dom.details.appendChild(dom.summary);
    dom.details.appendChild(dom.monitor);
    document.querySelector('main > section > header').appendChild(dom.details);
    if(localStorage.getItem( 'fnp.user.token')){
      user.token = atob( localStorage.getItem( 'fnp.user.token' ) );
    }else{
      monitor('guest', '<a href="' + repo.home + '/login/">login</a>');
    }
    if(!url.page) url.script = 'home'; else {
      if(!url.setup) url.script = url.page; else url.script = url.page + '.' + url.setup;
    }
    apiCall.accept = 'application/vnd.github.v3.full+json';
    apiCall.method = 'GET';
    apiCall.data = '';
    apiCall.url = repo.API + "/git/refs/heads/master";
    apiCall.cb = function(){
      repo.ref = JSON.parse( this.responseText );
      repo.sha = repo.ref.object.sha;
      fnp.getThisRepo();
    };
    apiCall.err = function(){
      monitor( 'error', 'cannot read HEAD' );
    };
    apiCall.call();
  },
  getThisRepo: function(){
    apiCall.url = repo.API;
    apiCall.cb = function(){
      repo.content = JSON.parse( this.responseText );
      if(url.hash && url.hash.slice(0,7) == 'master=') repo.sha = url.hash.slice(7);
      monitor('repository', '<a href="https://github.com/' + repo.content.full_name + '">' + repo.content.full_name + '</a> HEAD: ' + repo.sha.slice(0,7));
      // ORGANIZATION
      if( repo.content.owner.type == "Organization" ){
        repo.type = 'org';
        monitor( "game started", repo.content.created_at );
        monitor( "players", repo.content.forks );
        if(repo.content.permissions && repo.content.permissions.admin === true){
          user.type = 'owner';
          fnp.checkPulls();
        }else{
          user.type = 'guest';
          fnp.loadScript();
        }
      }
      // PLAYER
      if( repo.content.owner.type == "User" ){
        repo.type = 'usr';
        if(repo.content.fork){
          monitor( "game started", repo.content.parent.created_at );
          monitor( "players", repo.content.parent.forks );
          if( repo.content.permissions && repo.content.permissions.admin === true ){
            user.type = 'owner';
            fnp.checkDataParent();
          }else{
            user.type = 'guest';
            fnp.loadScript();
          }
          monitor( "joined", repo.content.created_at );
        }else{
          monitor( "error", "user repo is not a fork");
        }
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read repository');
    };
    apiCall.call();
  },
  checkDataParent: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.content.parent.full_name + "/git/refs/heads/data";
    apiCall.cb = function(){
      parent.data.ref = JSON.parse( this.responseText );
      parent.data.sha = parent.data.ref.object.sha;
      monitor( 'parent repository', '<a href="http://' + repo.content.parent.owner.login + '.github.io/' + repo.content.parent.name + '">' + repo.content.parent.full_name + '</a> HEAD:' + parent.data.sha.slice(0,7) );
      fnp.checkData();
    };
    apiCall.err = function(){
      monitor('error','cannot read parent data HEAD');
    };
    apiCall.call();
  },
  checkData: function(){
    apiCall.url = repo.API + "/git/refs/heads/data";
    apiCall.cb = function(){
      repo.data.ref = JSON.parse( this.responseText );
      repo.data.sha = repo.data.ref.object.sha;
      if(url.hash && url.hash.slice(0,5) == 'data=') repo.data.sha = url.hash.slice(5);
      if( repo.data.sha == parent.data.sha ){
        monitor( '<em>data</em> HEAD', repo.data.sha.slice(0,7) );
        fnp.checkMasterParent();
      }else{
        monitor( '<em>data</em> HEAD', 'need update from ' + parent.data.sha.slice(0,7) );
        fnp.update('data', parent.data.sha);
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read data HEAD');
    };
    apiCall.call();
  },
  checkPulls: function(){
    apiCall.url = repo.API + "/pulls";
    apiCall.cb = function(){
      repo.pulls = JSON.parse( this.responseText );
      if( repo.pulls.length !== 0 ){
        monitor( "pending pulls", "<a href='" + repo.content.html_url + "/pulls'>" + repo.pull.length + ' pulls</a>' );
      }else{
        monitor( "pending pulls", "no pulls" );
        fnp.checkMasterParent();
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read Pulls');
    };
    apiCall.call();
  },
  checkMasterParent: function(){
    if(repo.content.fork){
      apiCall.url = "https://api.github.com/repos/" + repo.content.parent.full_name + "/git/refs/heads/master";
      apiCall.cb = function(){
        parent.ref = JSON.parse( this.responseText );
        parent.sha = parent.ref.object.sha;
        monitor( 'parent repository', '<a href="http://' + repo.content.parent.owner.login + '.github.io/' + repo.content.parent.name + '">' + repo.content.parent.full_name + '</a> HEAD: ' + parent.sha.slice(0,7) );
        if( repo.sha == parent.sha ){
          fnp.loadScript();
        }else{
          monitor( '<em>master</em> HEAD', 'need update from ' + parent.sha.slice(0,7) );
          fnp.update('master', parent.sha);
        }
      };
      apiCall.err = function(){
        monitor('error','cannot read parent HEAD');
      };
      apiCall.call();
    }else{
      fnp.loadScript();
    }
  },
  update: function(branch, sha){
    apiCall.url = repo.API + "/git/refs/heads/" + branch;
    apiCall.accept = 'application/vnd.github.v3.patch';
    apiCall.method = 'PATCH';
    apiCall.data = '{"sha":"' + sha + '"}';
    apiCall.cb = function(){
      apiCall.accept = 'application/vnd.github.v3.full+json';
      apiCall.method = 'GET';
      apiCall.data = '';
      monitor( '<em>' + branch + '</em> updated', '<a href="' + window.location.href + '#' + branch + '=' + sha + '">proceed</a>');
    };
    apiCall.err = function(){
      monitor('error','cannot update ' + branch);
    };
    apiCall.call();
  },
  loadScript: function(){
    var script = document.createElement("script");
    var file = url.script + '.js';
    if(repo.sha) script.src = repo.cdn + repo.sha + '/scripts/' + file; else script.src = repo.static + 'master/scripts/' + file;
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
  dom.monitor.appendChild( listItem );
}

function appendi( what, container, text){
  var ele = document.createElement(what);
  ele.innerHTML = text;
  document.querySelector(container).appendChild(ele);
}

function searchFile(file){
  if(repo.data.sha) return repo.API + '/contents/' + file + '?ref=' + repo.data.sha; else return repo.API + '/contents/' + file + '?ref=data';
}

// START
var start = fnp.start();
