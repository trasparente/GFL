// league.setup.js

fnp.leagues = {};
fnp.setup = {};

fnp.league = {
  start: function(){
    if (fnp.user.type == 'owner' && fnp.repo.type == 'Organization') fnp.league.checkSetup(); else window.location = fnp.repo.home;
  },
  checkSetup: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.default = JSON.parse( Base64.decode(this.content) );
        fnp.setup.sha = this.sha;
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'setup: <a href="' + fnp.repo.home + '/setup/">edit</a>' });
        fnp.league.checkLeagues();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'warning: no setup, <a href="' + fnp.repo.home + '/setup/">create</a>' });
      }
    });
  },
  checkLeagues: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('leagues/leagues.json'),
      cb: function(){
        fnp.leagues.content = 'present';
        fnp.leagues.default = JSON.parse( Base64.decode(this.content) );
        fnp.leagues.sha = this.sha;
        fnp.league.Edit();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'warning: no leagues' });
        fnp.leagues.default = {};
        fnp.leagues.content = 'absent';
        fnp.league.Edit();
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
          schema: fnp.setup.schema.properties.leagues,
          startval: fnp.leagues.default,
          no_additional_properties: false,
          required_by_default: false,
          // Special
          disable_properties: true,
          disable_edit_json: true,
          disable_array_reorder: false
        });
        fnp.dom.submit.addEventListener('click',function() { fnp.league.save(editor.getValue()); });
        fnp.dom.cancel.addEventListener('click',function() { window.location = fnp.repo.home; });
        editor.on('change',function() {
          var errors = editor.validate();
          if(errors.length) {
            console.log(errors);
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
    for (var i = 0; i < dati.length; i++) {
      if ( !dati[i].slug ) dati[i].slug = (fnp.leagues.sha) ? fnp.leagues.sha : fnp.repo.master;
    }
    fnp.leagues.encoded = Base64.encode(JSON.stringify(dati));
    fnp.apiCall({
      url: fnp.repo.API + '/contents/leagues/leagues.json',
      method: 'PUT',
      data: fnp.leagues.content == 'absent' ? '{"message": "leagues created", "content": "' + fnp.leagues.encoded + '", "branch": "data"}' : '{"message": "leagues edited", "content": "' + fnp.leagues.encoded + '", "branch": "data", "sha": "' + fnp.leagues.sha + '"}',
      cb: function(){
        fnp.repo.data.sha = this.commit.sha;
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'saved: <a href="' + fnp.repo.home + '/league/setup/#data=' + fnp.repo.data.sha + '" onclick="window.location.reload()">proceed</a>' });
      }
    });
  }
};

fnp.league.start();
