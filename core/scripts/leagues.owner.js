var league = {
  start: function(){
    apiCall.accept = 'application/vnd.github.v3.full+json';
    apiCall.method = 'GET';
    return league.checkPulls();
  },
  checkPulls: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name;
    apiCall.url += "/pulls";
    apiCall.cb = function(){
      repo.pulls = JSON.parse( this.responseText );
      if( repo.pulls.length !== 0 ){
        monitor( "pending pulls", "<a href='" + repo.content.html_url + "/pulls'>" + repo.pull.length + ' pulls</a>' );
      }else{
        monitor( "pending pulls", "no pulls" );

      }
      // url = "https://api.github.com/repos/" + username + "/" + reponame + "/contents/schema/settings.json";
      // getAPI( url, gmSettings, gmNosettings, '{"ref":"master"}' );
    };
    apiCall.err = function(){
      console.log(this.responseText);
    };
    apiCall.call();
  }
};

var start = league.start();
