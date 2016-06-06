// setup.js

var setupSchema = {}, pullResponse;

if (userType != 'owner' || repoType != 'Organization') window.location = repoHome;

setupEditor();

apiCall({
  url: fileUrl('master', 'schema/setup.json'),
  cb: function(){
    setupSchema = JSON.parse( atob(this.content) );
    // Initialize the editor
    var editor = new JSONEditor(domEditor,{
      ajax: true,
      schema: setupSchema,
      startval: jsonSetup,
      no_additional_properties: false,
      required_by_default: false,
      // Special
      disable_properties: true,
      disable_edit_json: true,
      disable_array_reorder: false
    });
    domSubmit.addEventListener('click',function() { saveSetup(editor.getValue()); });
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

function saveSetup(dati){
  hideEditor();
  var encodedSetup = b64e(JSON.stringify(dati));
  apiCall({
    url: repoAPI + '/contents/setup.json',
    method: 'PUT',
    data: shaSetup ? '{"message": "setup created", "content": "' + encodedSetup + '", "branch": "data"}' : '{"message": "setup modified", "content": "' + encodedSetup + '", "branch": "data", "sha": "' + shaSetup + '"}',
    cb: function(){
      sessionStorage.setItem('masterRef', this.commit.sha);
      domAlert('saved: <a href="' + repoHome + '">proceed</a>');
    }
  });
}
