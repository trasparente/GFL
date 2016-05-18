// team.setup.js

fnp.setup = {};

fnp.team = {
  start: function(){
    if (fnp.user.type == 'owner' && fnp.repo.type == 'User') fnp.league.checkSetup(); else window.location = fnp.repo.home;
  },
  checkSetup: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.default = JSON.parse( Base64.decode(this.content) );
        fnp.setup.sha = this.sha;
        fnp.league.checkTeam();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'error: no setup' });
      }
    });
  },
  checkTeam: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('teams/' + fnp.repo.owner + '.json'),
      cb: function(){
        fnp.team.default = JSON.parse( Base64.decode(this.content) );
        fnp.team.sha = this.sha;
        fnp.team.Edit();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'warning: no team' });
        fnp.team.default = {};
        fnp.team.content = 'absent';
        fnp.team.Edit();
      }
    });
  },
  Edit: function(){
    fnp.dom.setup();

    // load schema
    fnp.apiCall({
      url: fnp.searchMasterFile('schema/setup.json'),
      cb: function(){
        fnp.setup.schema = JSON.parse( Base64.decode(this.content) );
        // Initialize the editor
        var editor = new JSONEditor(fnp.dom.editor,{
          ajax: true,
          schema: fnp.setup.schema.properties.team,
          startval: fnp.team.default,
          no_additional_properties: false,
          required_by_default: false,
          // Special
          disable_properties: true,
          disable_edit_json: true,
          disable_array_reorder: false
        });
        fnp.dom.submit.addEventListener('click',function() { fnp.team.save(editor.getValue()); });
        fnp.dom.cancel.addEventListener('click',function() { window.location = fnp.repo.home; });
        editor.on('change',function() {
          var errors = editor.validate();
          if(errors.length) {
            fnp.dom.valid.style.color = 'red';
            fnp.dom.valid.textContent = "not valid";
          } else {
            fnp.dom.valid.style.color = 'green';
            fnp.dom.valid.textContent = "valid";
          }
        });
      }
    });
  },
  save: function(dati){
    fnp.dom.hide();
    fnp.team.encoded = Base64.encode( JSON.stringify(dati) );
    fnp.apiCall({
      url: fnp.repo.API + '/contents/teams/' + fnp.repo.owner + '.json',
      method: 'PUT',
      data: fnp.team.content == 'absent' ? '{"message": "team created", "content": "' + fnp.team.encoded + '", "branch": "data"}' : '{"message": "team edited", "content": "' + fnp.team.encoded + '", "branch": "data", "sha": "' + fnp.team.sha + '"}',
      cb: function(){
        fnp.repo.data.sha = this.commit.sha;
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'saved: <a href="' + fnp.repo.home + '/league/setup/#data=' + fnp.repo.data.sha + '" onclick="window.location.reload()">proceed</a>' });
      }
    });
  }
};

fnp.league.start();
