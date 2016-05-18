// league.js

fnp.leagues = {};
fnp.setup = {};

fnp.league = {
  slug: function(){
    return fnp.url.hash && fnp.url.hash.slice(0,7) === 'league=' ? fnp.url.hash.slice(7) : false;
  },
  start: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.default = JSON.parse( fnp.b64d(this.content) );
        fnp.setup.sha = this.sha;
        fnp.league.checkLeagues();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'error: no setup' });
      }
    });
  },
  checkLeagues: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('leagues/leagues.json'),
      cb: function(){
        fnp.leagues.content = 'present';
        fnp.leagues.default = JSON.parse( fnp.b64d(this.content) );
        fnp.leagues.sha = this.sha;
        fnp.league.showDetails();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'error: no leagues' });
      }
    });
  },
  showDetails: function(){
    fnp.league.obj = fnp.leagues.default.filter(function( obj ) {
      return obj.slug == fnp.league.slug();
    });
    console.log(fnp.league.obj);
  }
};

fnp.league.start();
