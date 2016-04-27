// home.js

var leagues = {},
  setup = {};

var home = {
  start: function(){
    apiCall.url = repo.API + "/contents/setup.json";
    if(repo.data.sha) apiCall.data = '{"ref":' + repo.data.sha + '}'; else apiCall.data = '{"ref": "data"}';
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
    if(repo.data.sha) apiCall.data = '{"ref":' + repo.data.sha + '}'; else apiCall.data = '{"ref": "data"}';
    apiCall.cb = function(){
      leagues.content = JSON.parse( this.responseText );
      apiCall.data = '';
      leagues.obj = JSON.parse( atob(leagues.content.content) );
      console.log('defaul content is "automatic" league', leagues.obj);
    };
    apiCall.err = function(){
      monitor('warning','no leagues');
    };
    apiCall.call();
  }
};

var start = home.start();
