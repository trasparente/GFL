// league.js

var teamLoad = repoOwner;

if(urlHash && urlHash.slice(0,5) === 'team=') {
  teamLoad = urlHash.slice(5);
  apiCall({
    url: fileUrl('teams', 'teams/' + teamLoad + '.json'),
    cb: function(){
      jsonTeam = JSON.parse( b64d(this.content) );
      shaTeam = this.sha;
      showTeam();
    },
    err: function(){
      domAppend({ tag: 'li', parent: monitorString, innerHTML: 'team ' + teamLoad + ': not found' });
    }
  });
}

function showTeam(){
  domAppend({ tag: 'li', parent: monitorString, innerHTML: 'team loaded: ' + teamLoad });
  console.log(jsonTeam);
}
