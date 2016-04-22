var leagues = {},
  core = {},
  dom = {};

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
        league.checkCore();
      }
    };
    apiCall.err = function(){
      console.log(this.responseText);
    };
    apiCall.call();
  },
  checkCore: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/contents/core/json/core.json";
    apiCall.data = '{"ref":' + repo.ref.object.sha + '}';
    apiCall.cb = function(){
      league.checkTemplates();
    };
    apiCall.err = function(){
      create.Core();
    };
    apiCall.call();
  },
  checkTemplates: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/contents/core/json/templates.json";
    apiCall.data = '{"ref":' + repo.ref.object.sha + '}';
    apiCall.cb = function(){
      leagues.checkLeagues();
    };
    apiCall.err = function(){
      leagues.createTemplates();
    };
    apiCall.call();
  },
  checkLeagues: function(){
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/contents/leagues/leagues.json";
    apiCall.data = '{"ref":' + repo.ref.object.sha + '}';
    apiCall.cb = function(){
      leagues.content = JSON.parse( this.responseText );
      console.log('defaul content is "automatic" league');
    };
    apiCall.err = function(){
      console.log(this.responseText);
    };
    apiCall.call();
  },
  createTemplates: function(){

  }
};

var create = {
  Core: function(){
    // load json-editor
    apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/contents/core/scripts/jsoneditor.js";
    apiCall.data = '{"ref":' + repo.ref.object.sha + '}';
    apiCall.cb = function(){
      var script = JSON.parse( this.responseText );
      var added = document.createElement("script");
      added.type = 'text/javascript';
      added.innerHTML = atob(script.content);
      document.body.appendChild(added);

      // add elements
      dom.submit = document.createElement('button');
      dom.submit.innerHTML = 'Pull on master';
      dom.restore = document.createElement('button');
      dom.restore.innerHTML = 'Restore empty';
      var section = document.querySelector('section#logged');
      dom.valid = document.createElement('span');
      dom.editor = document.createElement('div');
      section.appendChild(dom.editor);
      section.appendChild(dom.submit);
      section.appendChild(dom.restore);
      section.appendChild(dom.valid);

      // start json editor
      // default file
      core.default = {};
      // load schema
      apiCall.url = "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/contents/core/json/core-schema.json";
      apiCall.data = '{"ref":' + repo.ref.object.sha + '}';
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
          console.log(editor.getValue());
        });
        dom.restore.addEventListener('click',function() {
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
        console.log(this.responseText);
      };
      apiCall.call();

      // leagues.checkTemplates();
    };
    apiCall.err = function(){
      // not present
    };
    apiCall.call();
  }
};

var start = league.start();
