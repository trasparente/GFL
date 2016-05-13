// updater.js

fnp.parent = {
  data: {}
};

fnp.dom = {
  get section() {return 'main > section';},
  get ul() {return 'main > section > header > details > ul';},
  setup: function(){
    fnp.appendi({ tag: 'details', parent: 'main > section > header', attributes: { open: '' } });
    fnp.appendi({ tag: 'ul', parent: 'section > header > details', attributes: {} });
    fnp.appendi({ tag: 'summary', parent: 'section > header > details', innerHTML: 'Monitor' });
  },
  hide: function(){
    var divs = document.querySelector('div[data-schemaid]');
    divs.setAttribute('hidden','');
    fnp.dom.cancel.setAttribute('hidden','');
    fnp.dom.valid.setAttribute('hidden','');
    fnp.dom.submit.setAttribute('hidden','');
  },
  showLeagues: function(leaguesArray){
    var divLeagues = fnp.appendi({ tag: 'div', parent: fnp.dom.section, attributes: { class: 'leagues' } });
    for( i=0; i < leaguesArray.length; i++ ){
      fnp.appendi({ tag: 'a', parent: divLeagues, innerHTML: fnp.leagues.default[i].title, attributes: { href: fnp.repo.home + '/league/#league=' + fnp.leagues.default[i].slug } });
    }
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
          fnp.goGuest();
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
            fnp.goGuest();
          }
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'joined: ' + this.created_at });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'error: user repo is not a fork' });
        }
      }
    }
  });
};

fnp.goGuest = function(){
  fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'guest: <a href="' + fnp.repo.home + '/login/">login</a>' });
  fnp.appendi({ tag: 'script', parent: 'body', attributes: { src: fnp.repo.rawgit + '/scripts/' + fnp.url.script + '.js', type: 'text/javascript' } });
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
  if(fnp.repo.data.sha=='data'){
    // Get data HEAD
    fnp.apiCall({
      url: fnp.repo.API + "/git/refs/heads/data",
      cb: function(){
        fnp.repo.data.sha = this.object.sha;
        if( fnp.repo.data.sha == fnp.parent.data.sha || fnp.repo.type == "Organization" ){
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>data</em> HEAD: ' + fnp.repo.data.sha.slice(0,7) });
          fnp.checkMasterParent();
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>data</em> HEAD: need update from ' + fnp.parent.data.sha.slice(0,7) });
          fnp.update('data', fnp.parent.data.sha);
        }
      }
    });
  }else{
    fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: '<em>data</em> HEAD: ' + fnp.repo.data.sha.slice(0,7) });
    fnp.checkMasterParent();
  }
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

fnp.searchDataFile = function(file){
  return fnp.repo.API + '/contents/' + file + '?ref=' + (fnp.repo.data.sha ? fnp.repo.data.sha : 'data');
};

fnp.searchMasterFile = function(file){
  return fnp.repo.API + '/contents/' + file + '?ref=' + (fnp.repo.master ? fnp.repo.master : 'master');
};

fnp.updater = function(){
	fnp.dom.setup();
  fnp.getThisRepo();
};

fnp.updater();
