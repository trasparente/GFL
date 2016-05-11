// league.setup.js

fnp.leagues = {};

fnp.league = {
  start: function(){
    if (fnp.user.type == 'owner' && fnp.repo.type == 'Organization') fnp.league.checkSetup(); else window.location = fnp.repo.home;
  },
  checkSetup: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.content = this;
        fnp.setup.default = JSON.parse( atob(this.content) );
        fnp.setup.sha = this.sha;
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
        fnp.leagues.content = this;
        fnp.leagues.default = JSON.parse( atob(this.content) );
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
    fnp.dom.editor = fnp.appendi({ tag: 'div', parent: 'section', attributes: {} });
    fnp.dom.submit = fnp.appendi({ tag: 'button', parent: 'section', innerHTML: 'Save data/leagues.json' });
    fnp.dom.reset = fnp.appendi({ tag: 'button', parent: 'section', innerHTML: 'Reset default' });
    fnp.dom.valid = fnp.appendi({ tag: 'span', parent: 'section', attributes: {} });

    // load schema
    fnp.apiCall({
      url: fnp.searchMasterFile('schema/setup.json'),
      cb: function(){
        fnp.setup.schemaBlob = this;
        fnp.setup.schema = JSON.parse( atob(this.content) );
        // Initialize the editor
        var editor = new JSONEditor(fnp.dom.editor,{
          ajax: true,
          schema: fnp.setup.schema.leagues,
          startval: fnp.leagues.default,
          no_additional_properties: false,
          required_by_default: false,
          // Special
          disable_properties: true,
          disable_edit_json: true,
          disable_array_reorder: false
        });
        fnp.dom.submit.addEventListener('click',function() {
          fnp.dom.submit.setAttribute('disabled','');
          fnp.leagues.encoded = btoa( JSON.stringify(editor.getValue()) );
          fnp.apiCall({
            url: fnp.searchDataFile('leagues/leagues.json'),
            method: 'PUT',
            data: fnp.leagues.content == 'absent' ? '{"message": "leagues created", "content": "' + fnp.leagues.encoded + '", "branch": "data"}' : '{"message": "leagues edited", "content": "' + fnp.leagues.encoded + '", "branch": "data", "sha": "' + fnp.leagues.sha + '"}',
            cb: function(){
              fnp.repo.data.sha = this.commit.sha;
              var divs = document.querySelector('div[data-schemaid]');
              divs.setAttribute('hidden','');
              fnp.dom.reset.setAttribute('hidden','');
              fnp.dom.valid.setAttribute('hidden','');
              fnp.dom.submit.setAttribute('hidden','');
              fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'saved: <a href="' + fnp.repo.home + '/leagues/setup/#data=' + fnp.repo.data.sha + '" onclick="window.location.reload()">proceed</a>' });
            }
          });
        });
        fnp.dom.reset.addEventListener('click',function() {
          editor.setValue(fnp.leagues.default);
        });
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
  }
};

fnp.league.start();
