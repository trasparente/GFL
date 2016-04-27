// home.js

var leagues = {},
  setup = {};

var home = {
  start: function(){
    monitor('repository', '<a href="https://github.com/' + repo.content.full_name + '">' + repo.content.full_name + '</a>');
    if (user.type == 'guest') home.checkSetup();
    if (user.type == 'owner' && repo.type == 'org') home.checkPulls();
    if (user.type == 'owner' && repo.type == 'usr') home.checkDataParent();
  },
  checkDataParent: function(){
    if(repo.content.fork){
      apiCall.url = "https://api.github.com/repos/" + repo.content.parent.full_name + "/git/refs/heads/data";
      apiCall.cb = function(){
        parent.data.ref = JSON.parse( this.responseText );
        parent.data.sha = parent.data.ref.object.sha;
        monitor( 'forked from', '<a href="http://' + repo.content.parent.owner.login + '.github.io/' + repo.content.parent.name + '">' + repo.content.parent.full_name + '</a>' );
        monitor( 'parent <em>data</em> SHA', parent.data.sha.substring(0,7) );
        home.checkData();
      };
      apiCall.err = function(){
        monitor('error','cannot read parent data SHA');
      };
      apiCall.call();
    }else{
      home.checkData();
    }
  },
  checkData: function(){
    apiCall.url = repo.API + "/git/refs/heads/data";
    apiCall.cb = function(){
      repo.data.ref = JSON.parse( this.responseText );
      repo.data.sha = repo.data.ref.object.sha;
      if( repo.data.sha == parent.data.sha || !repo.content.fork ){
        monitor( '<em>data</em> SHA', repo.data.sha.substring(0,7) );
        home.checkMasterParent();
      }else{
        monitor( '<em>data</em> SHA', 'need update from ' + parent.data.sha.substring(0,7) );
        home.update('data', parent.data.sha);
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read data SHA');
    };
    apiCall.call();
  },
  update: function(branch, sha){
    apiCall.url = repo.API + "/git/refs/heads/" + branch;
    apiCall.accept = 'application/vnd.github.v3.patch';
    apiCall.method = 'PATCH';
    apiCall.data = '{"sha":"' + sha + '"}';
    apiCall.cb = function(){
      apiCall.accept = 'application/vnd.github.v3.full+json';
      apiCall.method = 'GET';
      monitor(branch + 'updated', '<a href="' + repo.home + '">proceed</a>');
    };
    apiCall.err = function(){
      monitor('error','cannot update ' + branch);
    };
    apiCall.call();
  },
  checkSetup: function(){
    apiCall.url = repo.API + "/contents/setup.json";
    if(repo.data.sha){
      apiCall.data = '{"ref":' + repo.data.sha + '}';
    }else{
      apiCall.data = '{"ref": "data"}';
    }
    apiCall.cb = function(){
      setup.content = JSON.parse( this.responseText );
      apiCall.data = '';
      setup.obj = JSON.parse( atob(setup.content.content) );
      console.log('setup', setup.obj);
      home.checkLeagues();
    };
    apiCall.err = function(){
      if(repo.type == 'org' && user.type == 'owner') monitor('warning','no setup, <a href="' + repo.home + '/setup/">create</a>'); else monitor('warning','no setup');
    };
    apiCall.call();
  },
  checkLeagues: function(){
    apiCall.url = repo.API + "/contents/leagues/leagues.json";
    if(repo.data.sha){
      apiCall.data = '{"ref":' + repo.data.sha + '}';
    }else{
      apiCall.data = '{"ref": "data"}';
    }
    apiCall.cb = function(){
      leagues.content = JSON.parse( this.responseText );
      apiCall.data = '';
      leagues.obj = JSON.parse( atob(leagues.content.content) );
      console.log('defaul content is "automatic" league', leagues.obj);
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
        home.checkDataSHA();
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
        monitor( 'forked from', '<a href="http://' + repo.content.parent.owner.login + '.github.io/' + repo.content.parent.name + '">' + repo.content.parent.full_name + '</a>' );
        monitor( 'parent <em>master</em> SHA', parent.sha.substring(0,7) );
        home.checkMaster();
      };
      apiCall.err = function(){
        monitor('error','cannot read parent SHA');
      };
      apiCall.call();
    }else{
      home.checkMaster();
    }
  },
  checkMaster: function(){
    apiCall.url = repo.API + "/git/refs/heads/master";
    apiCall.cb = function(){
      repo.ref = JSON.parse( this.responseText );
      repo.sha = repo.ref.object.sha;
      if( repo.sha == parent.sha || !repo.content.fork ){
        monitor( '<em>master</em> SHA', repo.sha.substring(0,7) );
        home.checkSetup();
      }else{
        monitor( '<em>master</em> SHA', 'need update from ' + parent.sha.substring(0,7) );
        home.update('master', parent.sha);
      }
    };
    apiCall.err = function(){
      monitor('error', 'cannot read SHA');
    };
    apiCall.call();
  },
  checkDataSHA: function(){
    apiCall.url = repo.API + "/git/refs/heads/data";
    apiCall.cb = function(){
      repo.data.ref = JSON.parse( this.responseText );
      repo.data.sha = repo.data.ref.object.sha;
      monitor( '<em>data</em> SHA', repo.data.sha.substring(0,7) );
      home.checkMasterParent();
    };
    apiCall.err = function(){
      monitor('error', 'cannot read data SHA');
    };
    apiCall.call();
  }
};

var start = home.start();
