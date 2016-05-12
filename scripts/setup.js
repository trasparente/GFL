// setup.js

fnp.setup = {
  start: function(){
    if (fnp.user.type == 'owner' && fnp.repo.type == 'Organization') fnp.setup.checkSetup(); else window.location = fnp.repo.home;
  },
  checkSetup: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.content = this;
        fnp.setup.default = JSON.parse( atob(this.content) );
        fnp.setup.sha = this.sha;
        fnp.setup.Edit();
      },
      err: function(){
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'warning: no setup' });
        fnp.setup.default = {};
        fnp.setup.content = 'absent';
        fnp.setup.Edit();
      }
    });
  },
  Edit: function(){
    fnp.dom.editor = fnp.appendi({ tag: 'div', parent: 'section', attributes: {} });
    fnp.dom.cancel = fnp.appendi({ tag: 'button', parent: 'section', innerHTML: 'Cancel' });
    fnp.dom.submit = fnp.appendi({ tag: 'button', parent: 'section', innerHTML: 'Save setup' });
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
          schema: fnp.setup.schema,
          startval: fnp.setup.default,
          no_additional_properties: false,
          required_by_default: false,
          // Special
          disable_properties: true,
          disable_edit_json: true,
          disable_array_reorder: false
        });
        fnp.dom.submit.addEventListener('click',function() { fnp.setup.save(editor.getValue()); });
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
    fnp.setup.encoded = btoa( JSON.stringify(dati) );
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      method: 'PUT',
      data: fnp.setup.content == 'absent' ? '{"message": "setup created", "content": "' + fnp.setup.encoded + '", "branch": "data"}' : '{"message": "setup modified", "content": "' + fnp.setup.encoded + '", "branch": "data", "sha": "' + fnp.setup.sha + '"}',
      cb: function(){
        fnp.repo.data.sha = this.commit.sha;
        fnp.appendi({ tag: 'li', parent: fnp.dom.ul, innerHTML: 'saved: <a href="' + fnp.repo.home + '/setup/#data=' + fnp.repo.data.sha + '" onclick="window.location.reload()">proceed</a>' });
      }
    });
  }
};

fnp.setup.start();
