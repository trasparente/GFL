// team-setup.js

var setupSchema = {}, pullResponse;

if (userType != 'owner' || repoType != 'Organization') window.location = repoHome;

setupEditor();

apiCall({
  url: fileUrl('teams', 'teams/' + repoOwner + '.json'),
  cb: function(){
    jsonTeam = JSON.parse( b64d(this.content) );
    domAppend({ tag: 'li', parent: monitorString, innerHTML: 'team: found' });
    loadSetup();
  }
});

function loadSetup(){
  apiCall({
    url: fileUrl('master', 'schema/setup.json'),
    cb: function(){
      setupSchema = JSON.parse( atob(this.content) );
      // Initialize the editor
      var editor = new JSONEditor(domEditor,{
        ajax: true,
        schema: setupSchema.properties.team,
        startval: jsonTeam,
        no_additional_properties: false,
        required_by_default: false,
        // Special
        disable_properties: true,
        disable_edit_json: true,
        disable_array_reorder: false
      });
      domSubmit.addEventListener('click',function() { saveTeam(editor.getValue()); });
      domCancel.addEventListener('click',function() { window.location = repoHome; });
      editor.on('change',function() {
        var errors = editor.validate();
        if(errors.length) {
          console.log(errors);
          domValid.style.color = 'red';
          domValid.textContent = "not valid";
        } else {
          domValid.style.color = 'green';
          domValid.textContent = "valid";
        }
      });
    }
  });
}

function saveTeam(dati){
  hideEditor();
  var encodedTeam = b64e( JSON.stringify(dati) );
  apiCall({
    url: repoAPI + '/contents/teams/' + repoOwner + '.json',
    method: 'PUT',
    data: shaTeam ? '{"message": "team edited", "content": "' + encodedTeam + '", "branch": "data", "sha": "' + shaTeam + '"}' : '{"message": "team created", "content": "' + encodedTeam + '", "branch": "data"}',
    cb: function(){
      // sessionStorage.setItem('teamsRef', this.commit.sha);
      domAppend({ tag: 'li', parent: domUlGame, innerHTML: 'saved: creating pull request' });
      pullTeam();
    }
  });
}

function pullTeam(){
  apiCall({
    url: "https://api.github.com/repos/" + repoContent.parent.full_name + '/pulls',
    method: 'POST',
    data: '{"title": "team changed", "head": "' + repoOwner + ':teams", "base": "teams", "body": "Please pull this in!" }',
    cb: function(){
      pullResponse = this;
      sessionStorage.setItem('teamsRef', this.commit.sha);
      domAlert('pull requested #' + pullResponse + ': <a href="' + repoHome + '">proceed</a>');
    }
  });
}
