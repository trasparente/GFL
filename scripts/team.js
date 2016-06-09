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
      domAlert('team ' + teamLoad + ': not found');
    }
  });
}

function showTeam(){
  domAppend({ tag: 'li', parent: domUlGame, innerHTML: 'team loaded: ' + teamLoad });
  console.log(jsonTeam);
  showReadme();
}
