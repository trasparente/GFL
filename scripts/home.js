// home.js

var jsonSetup = {},
    shaSetup,
    jsonLeagues = {},
    shaLeagues,
    jsonTeam = {},
    shaTeam;

function loadSetup(){
  apiCall({
    url: fileUrl('master', 'setup.json'),
    cb: function(){
      // jsonSetup = this;
      jsonSetup = JSON.parse( b64d(this.content) );
      shaSetup = this.sha;
      if(repoType == 'Organization' && userType == 'owner') {
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'setup: <a href="' + repoHome + '/setup/">edit</a>' });
      }else{
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'setup: found' });
      }
      loadLeagues();
    },
    err: function(){
      if(repoType == 'Organization' && userType == 'owner'){
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'warning: no setup, <a href="' + repoHome + '/setup/">create</a>' });
      }else{
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'error: no setup' });
      }
    }
  });
}

function loadLeagues(){
  apiCall({
    url: fileUrl('master', 'leagues.json'),
    cb: function(){
      jsonLeagues = JSON.parse( b64d(this.content) );
      shaLeagues = this.sha;
      if(repoType == 'Organization' && userType == 'owner'){
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'leagues: <a href="' + repoHome + '/league/setup/">edit</a>' });
        showLeagues();
      }else{
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'leagues: found' });
        if(repoType == 'User' && userType == 'owner') leadTeam(); else showLeagues();
      }
    },
    err: function(){
      if(repoType == 'Organization' && userType == 'owner'){
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'warning: no leagues, <a href="' + repoHome + '/league/setup/">create</a>' });
      }else{
        domAppend({ tag: 'li', parent: monitorString, innerHTML: 'error: no leagues' });
      }
    }
  });
}

function loadTeam(){
  apiCall({
    url: fileUrl('teams', 'teams/' + repoOwner + '.json'),
    cb: function(){
      jsonTeam = JSON.parse( b64d(this.content) );
      shaTeam = this.sha;
      domAppend({ tag: 'li', parent: monitorString, innerHTML: 'team: <a href="' + repoHome + '/team/setup/">edit</a>' });
      showLeagues();
    },
    err: function(){
      domAppend({ tag: 'li', parent: monitorString, innerHTML: 'warning: no team, <a href="' + repoHome + '/team/setup/">create</a>' });
      showLeagues();
    }
  });
}

function showLeagues(){
  for( i=0; i < jsonLeagues.length; i++ ){
    var row = document.createElement('tr');
    row.innerHTML = '<td><a href="' + repoHome + '/league/#league=' + jsonLeagues[i].slug + '">' + jsonLeagues[i].title + '</a></td>';
    domTable.appendChild(row);
  }
  domSection.appendChild(domTable);
  showReadme();
}

function showReadme(){
  apiCall({
    url: repoAPI + '/readme?ref=' + 'gh-pages',
    accept: 'application/vnd.github.v3.html',
    cb: function(){
      domAppend({ tag: 'div', parent: domSection, innerHTML: this });
    }
  });
}

loadSetup();
