// setup.js

fnp.setup = {
  start: function(){
    if (fnp.user.type == 'owner' && fnp.repo.type == 'Organization') fnp.setup.checkSetup(); else window.location = fnp.repo.home;
  },
  checkSetup: function(){
    fnp.apiCall({
      url: fnp.searchDataFile('setup.json'),
      cb: function(){
        fnp.setup.content = 'present';
        fnp.setup.default = JSON.parse( fnp.b64d(this.content) );
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
    fnp.dom.setup();

    // load schema
    fnp.apiCall({
      url: fnp.searchMasterFile('schema/setup.json'),
      cb: function(){
        fnp.setup.schema = JSON.parse( fnp.b64d(this.content) );
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
    fnp.setup.encoded = fnp.b64e(JSON.stringify(dati));
    fnp.apiCall({
      url: fnp.repo.API + '/contents/setup.json',
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
