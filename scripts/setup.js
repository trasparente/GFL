// setup.js

var leagues = {},
  setup = {};

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
      owner.checkSetup();
    };
    apiCall.err = function(){
      monitor('error', 'cannot read SHA');
    };
    apiCall.call();
  },
  checkSetup: function(){
    apiCall.url = repo.API + "/contents/json/setup.json";
    if(repo.sha) apiCall.data = '{"ref":' + repo.sha + '}';
    apiCall.cb = function(){
      setup.content = JSON.parse( this.responseText );
      setup.default = JSON.parse( atob(setup.content.content) );
      setup.sha = setup.content.sha;
      apiCall.data = '';
      edit.Setup();
    };
    apiCall.err = function(){
      monitor('warning','no setup');
      setup.default = {};
      setup.content = 'absent';
      edit.Setup();
    };
    apiCall.call();
  }
};

var edit = {
  Setup: function(){
    // add DOM elements
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

    // load schema
    apiCall.url = repo.API + "/contents/json/setup-schema.json";
    if(repo.sha) apiCall.data = '{"ref":' + repo.sha + '}';
    apiCall.cb = function(){
      setup.schemaBlob = JSON.parse( this.responseText );
      setup.schema = JSON.parse(atob(setup.schemaBlob.content));
      // Initialize the editor
      var editor = new JSONEditor(dom.editor,{
        ajax: true,
        schema: setup.schema,
        startval: setup.default,
        no_additional_properties: false,
        required_by_default: false,
        // Special
        disable_properties: true,
        disable_edit_json: true,
        disable_array_reorder: false
      });
      dom.submit.addEventListener('click',function() {
        setup.encoded = btoa(editor.getValue());
        if(setup.content == 'absent'){
          apiCall.url = repo.API + '/contents/json/setup.json';
          apiCall.method = 'PUT';
          apiCall.data = '{"message": "setup created", "content": "' + setup.encoded + '", "branch": "master"}';
        }else{
          apiCall.url = repo.API + '/contents/json/setup.json';
          apiCall.method = 'PUT';
          apiCall.data = '{"message": "setup edited", "content": "' + setup.encoded + '", "branch": "master", "sha": "' + setup.sha + '"}';
        }
        apiCall.cb = function(){
          var divs = document.querySelector('div[data-schemaid]');
          divs.setAttribute('hidden','');
          monitor('saved', '<a href="' + repo.home + '/setup/">proceed</a>');
        };
        apiCall.err = function(){
          console.log('err', JSON.parse( this.responseText ));
        };
        apiCall.call();
      });
      dom.reset.addEventListener('click',function() {
        editor.setValue(setup.default);
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
      monitor('error', 'no setup-schema');
    };
    apiCall.call();
  }
};

var start = owner.start();
