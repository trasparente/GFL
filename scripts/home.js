// home.js

fnp.leagues = {};
fnp.setup = {};

fnp.home = {
  start: function(){
    fnp.apiCall({
      url: fnp.searchFile('setup.json'),
      cb: function(){
        fnp.setup.content = this;
        fnp.setup.default = JSON.parse( atob(this.content) );
        fnp.setup.sha = this.sha;
        if(fnp.repo.type == 'Organization' && fnp.user.type == 'owner') fnp.monitor('setup', '<a href="' + fnp.repo.home + '/setup">edit</a>'); else fnp.monitor('setup','found');
        fnp.home.checkLeagues();
      }
    });
  },
  checkLeagues: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('leagues/leagues.json'),
      cb: function(){
        fnp.leagues.content = this;
        fnp.leagues.obj = JSON.parse( atob(this.content) );
        if(fnp.repo.type == 'Organization' && fnp.user.type == 'owner') fnp.monitor('leagues', '<a href="' + fnp.repo.home + '/league/setup">edit</a>'); else fnp.monitor('leagues','found');
      }
    });
  }
};

fnp.home.start();
