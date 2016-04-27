// loader.js

var url = {},
  repo = { data: {} };

url.array = window.location.host.split( '.' );
url.slash = window.location.pathname.split( '/' );
url.hash = window.location.hash.substring( 1 );
repo.owner = url.array[0];
repo.name = url.slash[1];
if(url.slash[2]) url.page = url.slash[2];
if(url.slash[3]) url.setup = url.slash[3];
repo.home = "http://" + repo.owner + ".github.io/" + repo.name;
repo.API = "https://api.github.com/repos/" + repo.owner + "/" + repo.name;
repo.static = "https://rawgit.com/" + repo.owner + "/" + repo.name + "/";
repo.cdn = "https://cdn.rawgit.com/" + repo.owner + "/" + repo.name + "/";
function loadAssets() {
  var script = document.createElement("script");
  script.src = repo.static + "master/scripts/init.js";
  script.type = 'text/javascript';
  document.body.appendChild(script);
  if((url.page && url.page == 'setup') || (url.setup && url.page)){
    var jsoneditor = document.createElement("script");
    jsoneditor.src = repo.static + "master/scripts/jsoneditor.js";
    jsoneditor.type = 'text/javascript';
    document.body.appendChild(jsoneditor);
  }
  var style = document.createElement("link");
  style.href = repo.static + "master/styles/style.css";
  style.rel = 'stylesheet';
  document.head.appendChild(style);
}
if (window.addEventListener)
  window.addEventListener("load", loadAssets, false);
else if (window.attachEvent)
  window.attachEvent("onload", loadAssets);
else window.onload = loadAssets;
