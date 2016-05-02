// home.js

fnp.leagues = {};
fnp.setup = {};

fnp.home = {
  start: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.content = this;
        fnp.setup.default = JSON.parse( atob(this.content) );
        fnp.setup.sha = this.sha;
        if(fnp.repo.type == 'Organization' && fnp.user.type == 'owner') {
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'setup: <a href="' + fnp.repo.home + '/setup">edit</a>' } });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'setup: found' } });
        }
        fnp.home.checkLeagues();
      },
      err: function(){
        if(fnp.repo.type == 'Organization' && fnp.user.type == 'owner'){
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'warning: no setup, <a href="' + fnp.repo.home + '/setup/">create</a>' } });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'error: no setup' } });
        }
      }
    });
  },
  checkLeagues: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('leagues/leagues.json'),
      cb: function(){
        fnp.leagues.content = this;
        fnp.leagues.obj = JSON.parse( atob(this.content) );
        if(fnp.repo.type == 'Organization' && fnp.user.type == 'owner'){
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'leagues: <a href="' + fnp.repo.home + '/league/setup">edit</a>' } });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'leagues: found' } });
        }
      },
      err: function(){
        if(fnp.repo.type == 'Organization' && fnp.user.type == 'owner'){
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'warning: no leagues, <a href="' + fnp.repo.home + '/league/setup/">create</a>' } });
        }else{
          fnp.appendi({ tag: 'li', parent: fnp.dom.ul, attributes: { 'innerHTML': 'error: no leagues' } });
        }
      }
    });
  }
};

fnp.home.start();
