// home.js

var leagues = {},
  setup = {};

var home = {
  start: function(){
    apiCall.url = searchFile('setup.json');
    apiCall.cb = function(){
      setup.content = JSON.parse( this.responseText );
      setup.default = JSON.parse( atob(setup.content.content) );
      setup.sha = setup.content.sha;
      console.log('setup', setup.default);
      home.checkLeagues();
    };
    apiCall.err = function(){
      if(repo.type == 'org' && user.type == 'owner') monitor('warning','no setup, <a href="' + repo.home + '/setup/">create</a>'); else monitor('warning','no setup');
    };
    apiCall.call();
  },
  checkLeagues: function(){
    apiCall.url = searchFile('leagues/leagues.json');
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
