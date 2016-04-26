// owner.js

var leagues = {},
  core = {};

var owner = {
  start: function(){
    if (user.type == 'owner' && repo.type == 'org') owner.checkSHA(); else window.location = repo.home;
  },
  checkSHA: function(){
    apiCall.url = repo.API + "/git/refs/heads/master";
    apiCall.cb = function(){
      repo.ref = JSON.parse( this.responseText );
      repo.sha = repo.ref.object.sha;
      monitor( 'SHA', repo.sha.substring(0,7) );
      owner.checkCore();
    };
    apiCall.err = function(){
      monitor('error', 'cannot read SHA');
    };
    apiCall.call();
  },
  checkCore: function(){
    apiCall.url = repo.API + "/contents/core/json/core.json";
    if(repo.sha) apiCall.data = '{"ref":' + repo.sha + '}';
    apiCall.cb = function(){
      core.content = JSON.parse( this.responseText );
      core.default = core.content;
      core.sha = core.content.content.sha;
      apiCall.data = '';
      edit.Core();
    };
    apiCall.err = function(){
      monitor('warning','no core');
      core.default = {};
      edit.Core();
    };
    apiCall.call();
  }
};

var edit = {
  Core: function(){
    // load json-editor
    var script = document.createElement("script");
    var file = 'jsoneditor.js';
    if(repo.sha) script.src = repo.static + repo.sha + '/core/scripts/' + file; else script.src = repo.static + 'master/core/scripts/' + file;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // add elements
    dom.submit = document.createElement('button');
    dom.submit.innerHTML = 'Pull request';
    dom.reset = document.createElement('button');
    dom.reset.innerHTML = 'Reset default';
    var section = document.querySelector('section');
    dom.valid = document.createElement('span');
    dom.editor = document.createElement('div');
    section.appendChild(dom.editor);
    section.appendChild(dom.submit);
    section.appendChild(dom.reset);
    section.appendChild(dom.valid);

    // start json editor
    // load schema
    apiCall.url = repo.API + "/contents/core/json/core-schema.json";
    if(repo.sha) apiCall.data = '{"ref":' + repo.sha + '}';
    apiCall.cb = function(){
      core.schemaBlob = JSON.parse( this.responseText );
      core.schema = JSON.parse(atob(core.schemaBlob.content));
      // Initialize the editor
      var editor = new JSONEditor(dom.editor,{
        ajax: true,
        schema: core.schema,
        startval: core.default,
        no_additional_properties: false,
        required_by_default: false,
        // Special
        disable_properties: true,
        disable_edit_json: true,
        disable_array_reorder: false
      });
      dom.submit.addEventListener('click',function() {
        core.encoded = btoa(editor.getValue());
        if(core.default == {}){
          apiCall.url = repo.API + '/contents/core/json/core.json';
          apiCall.method = 'PUT';
          apiCall.data = '{"message": "core created", "content": "' + core.encoded + '", "branch": "master"}';
        }else{
          apiCall.url = repo.API + '/contents/core/json/core.json';
          apiCall.method = 'PUT';
          apiCall.data = '{"message": "core created", "content": "' + core.encoded + '", "branch": "master", "sha": "' + core.sha + '"}';
        }
        console.log(editor.getValue());
      });
      dom.reset.addEventListener('click',function() {
        editor.setValue(core.default);
      });
      editor.on('change',function() {
        var errors = editor.validate();
        if(errors.length) {
          console.log(errors);
          dom.valid.style.color = 'red';
          dom.valid.textContent = "not valid";
        } else {
          dom.valid.style.color = 'green';
          dom.valid.textContent = "valid";
        }
      });
    };
    apiCall.err = function(){
      monitor('error', 'no core-schema');
    };
    apiCall.call();
  }
};

var start = owner.start();
