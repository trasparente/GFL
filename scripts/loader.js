// loader.js

fnp.parent = {
  data: {}
};

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
    if(xhr.readyState == 4){
      document.querySelector('body').style.backgroundColor = "white";
      if ( xhr.status == 200 ) {
        if (typeof obj.cb == "function") {
          if (xhr.getResponseHeader("X-RateLimit-Remaining") < 5) fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'rate limit: exceeded' });
          if (xhr.getResponseHeader("X-RateLimit-Remaining") < 2) window.location = fnp.repo.home + '/login/';
          var xrate = document.querySelector("footer > small");
          xrate.innerHTML = "X-RateLimit-Remaining: " + xhr.getResponseHeader( "X-RateLimit-Remaining" );
          obj.cb.apply( JSON.parse(xhr.responseText) );
        }
      }
      if ( xhr.status >= 400 ) {
        if(typeof obj.err == "function"){
          obj.err.apply( xhr );
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'api error: ' + obj.url });
          console.log( xhr );
        }
      }
    }
  };
  document.querySelector('body').style.backgroundColor = "whitesmoke";
  xhr.send( obj.data );
};

fnp.dom = {
  get ul() {return 'main > section > header > details > ul';},
  setup: function(){
    fnp.appendi({ tag: 'details', parent: 'main > section > header', attributes: { open: '' } });
    fnp.appendi({ tag: 'ul', parent: 'section > header > details', attributes: {} });
    fnp.appendi({ tag: 'summary', parent: 'section > header > details', innerHTML: 'Monitor' });
  }
};

fnp.getThisRepo = function(){
  fnp.apiCall({
    cb: function(){
      fnp.repo.content = this;
      fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'repository: <a href="https://github.com/' + this.full_name + '">' + this.full_name + '</a> ' + fnp.repo.master.slice(0,7) });
      fnp.repo.type = this.owner.type;
      // ORGANIZATION
      if( this.owner.type == "Organization" ){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'game started: ' + this.created_at });
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'players: ' + this.forks });
        if(this.permissions && this.permissions.admin === true){
          fnp.user.type = 'owner';
          fnp.checkPulls();
        }else{
          fnp.user.type = 'guest';
          fnp.appendi({ tag: 'script', parent: 'body', attributes: { src: fnp.repo.rawgit + '/scripts/' + fnp.url.script + '.js', type: 'text/javascript' } });
        }
      }
      // PLAYER
      if( this.owner.type == "User" ){
        if(this.fork){
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'game started: ' + this.parent.created_at });
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'players: ' + this.parent.forks });
          if( this.permissions && this.permissions.admin === true ){
            fnp.user.type = 'owner';
            fnp.checkDataParent();
          }else{
            fnp.user.type = 'guest';
            fnp.appendi({ tag: 'script', parent: 'body', attributes: { src: fnp.repo.rawgit + '/scripts/' + fnp.url.script + '.js', type: 'text/javascript' } });
          }
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'joined: ' + this.created_at });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'error: user repo is not a fork' });
        }
      }
    }
  });
};

fnp.checkPulls = function(){
  fnp.apiCall({
    url: fnp.repo.API + "/pulls",
    cb: function(){
      fnp.repo.pulls = this;
      if( fnp.repo.pulls.length !== 0 ){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'pending pulls: <a href="' + fnp.repo.content.html_url + '/pulls">' + fnp.repo.pulls.length + ' pulls</a>' });
      }else{
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'pending pulls: no' });
        fnp.checkData();
      }
    }
  });
};

fnp.checkDataParent = function(){
  // Get data parent HEAD
  fnp.apiCall({
    url: "https://api.github.com/repos/" + fnp.repo.content.parent.full_name + "/git/refs/heads/data",
    cb: function(){
      fnp.parent.data.sha = this.object.sha;
      fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'parent <em>data</em> HEAD: ' + fnp.parent.data.sha.slice(0,7) });
      fnp.checkData();
    }
  });
};

fnp.checkData = function(){
  // Get data HEAD
  fnp.apiCall({
    url: fnp.repo.API + "/git/refs/heads/data",
    cb: function(){
      fnp.repo.data.sha = this.object.sha;
      if( fnp.repo.data.sha == fnp.parent.data.sha || this.owner.type == "Organization" ){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>data</em> HEAD: ' + fnp.repo.data.sha.slice(0,7) });
        fnp.checkMasterParent();
      }else{
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>data</em> HEAD: need update from ' + fnp.parent.data.sha.slice(0,7) });
        fnp.update('data', fnp.parent.data.sha);
      }
    }
  });
};

fnp.checkMasterParent = function(){
  if(fnp.repo.content.fork){
    fnp.apiCall({
      url: "https://api.github.com/repos/" + fnp.repo.content.parent.full_name + "/git/refs/heads/master",
      cb: function(){
        fnp.parent.master = this.object.sha;
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'parent repository: <a href="http://' + fnp.repo.content.parent.owner.login + '.github.io/' + fnp.repo.content.parent.name + '">' + fnp.repo.content.parent.full_name + '</a> ' + fnp.parent.master.slice(0,7) });
        if( fnp.repo.master == fnp.parent.master ){
          fnp.appendi({ tag: 'script', parent: 'body', attributes: { src: fnp.repo.rawgit + '/scripts/' + fnp.url.script + '.js', type: 'text/javascript' } });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>master</em> HEAD: need update from ' + fnp.parent.master.slice(0,7) });
          fnp.update('master', fnp.parent.master);
        }
      }
    });
  }else{
    fnp.appendi({ tag: 'script', parent: 'body', attributes: { src: fnp.repo.rawgit + '/scripts/' + fnp.url.script + '.js', type: 'text/javascript' } });
  }
};

fnp.update = function(branch, sha){
  fnp.apiCall({
    url: fnp.repo.API + "/git/refs/heads/" + branch,
    data: '{"sha":"' + sha + '"}',
    accept: 'application/vnd.github.v3.patch',
    method: 'PATCH',
    cb: function(){
      fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>' + branch + '</em> updated: <a href="' + window.location.href + '#' + branch + '=' + sha + '" onclick="window.location.reload()">proceed</a>' });
    }
  });
};

fnp.getMasterHead = function(){
  fnp.apiCall({
    url: fnp.repo.API + "/git/refs/heads/master",
    cb: function(){
      fnp.repo.master = fnp.repo.master != 'master' ? fnp.repo.master : this.object.sha;
      fnp.getThisRepo();
    }
  });
};

fnp.searchDataFile = function(file){
  return fnp.repo.API + '/contents/' + file + '?ref=' + (fnp.repo.data.sha ? fnp.repo.data.sha : 'data');
};

fnp.searchMasterFile = function(file){
  return fnp.repo.API + '/contents/' + file + '?ref=' + (fnp.repo.master ? fnp.repo.master : 'master');
};

// loader

fnp.loader = function(){
  fnp.dom.setup();
  fnp.getMasterHead();
};

fnp.loader();
