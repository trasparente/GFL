// home.js

var leagues = {},
  core = {};

var home = {
  start: function(){
    if (user.type == 'guest') home.checkCore();
    if (user.type == 'owner' && repo.type == 'org') home.checkPulls();
    if (user.type == 'owner' && repo.type == 'usr') home.checkParentSHA();
  },
  checkParentSHA: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.content.parent.full_name + "/git/refs/heads/master";
    apiCall.cb = function(){
      parent.ref = JSON.parse( this.responseText );
      parent.sha = parent.ref.object.sha;
      monitor( 'forked from', '<a href="http://' + repo.content.parent.owner.login + '.github.io/' + repo.content.parent.name + '">' + repo.content.parent.owner.login + '/' + repo.content.parent.name + '</a>' );
      monitor( 'parent <em>master</em> SHA', parent.sha.substring(0,7) );
      home.checkSHA();
    };
    apiCall.err = function(){
      monitor('error','cannot read parent SHA');
    };
    apiCall.call();
  },
  checkSHA: function(){
    apiCall.url = repo.API + "/git/refs/heads/master";
    apiCall.cb = function(){
      repo.ref = JSON.parse( this.responseText );
      repo.sha = repo.ref.object.sha;
      if( repo.sha == parent.sha || repo.type == 'org' ){
        monitor( 'SHA', repo.sha.substring(0,7) );
        home.checkCore();
      }else{
        monitor( 'SHA', 'need update from ' + repo.sha.substring(0,7) );
        home.update();
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read SHA');
    };
    apiCall.call();
  },
  update: function(){
    apiCall.url = repo.API + "/git/refs/heads/master";
    apiCall.accept = 'application/vnd.github.v3.patch';
    apiCall.method = 'PATCH';
    apiCall.data = '{"sha":"' + parent.ref.object.sha + '"}';
    apiCall.cb = function(){
      apiCall.accept = 'application/vnd.github.v3.full+json';
      apiCall.method = 'GET';
      home.checkSHA();
    };
    apiCall.err = function(){
      monitor('error','cannot update master head');
    };
    apiCall.call();
  },
  checkCore: function(){
    apiCall.url = repo.API + "/contents/core/json/core.json";
    if(repo.sha) apiCall.data = '{"ref":' + repo.sha + '}';
    apiCall.cb = function(){
      core.content = JSON.parse( this.responseText );
      apiCall.data = '';
      console.log('core', core.content);
      home.checkLeagues();
    };
    apiCall.err = function(){
      if(repo.type == 'org' && user.type == 'owner') monitor('warning','no core, <a href="' + repo.home + '/setup/">create</a>'); else monitor('warning','no core');
    };
    apiCall.call();
  },
  checkLeagues: function(){
    apiCall.url = repo.API + "/contents/leagues/leagues.json";
    if(repo.sha) apiCall.data = '{"ref":' + repo.sha + '}';
    apiCall.cb = function(){
      leagues.content = JSON.parse( this.responseText );
      apiCall.data = '';
      console.log('defaul content is "automatic" league', leagues.content);
    };
    apiCall.err = function(){
      monitor('error','no leagues');
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
        home.checkSHA();
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read Pulls');
    };
    apiCall.call();
  },
};

var start = home.start();
