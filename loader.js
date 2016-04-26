// loader.js

var url = {},
  repo = {};
url.array = window.location.host.split( '.' );
url.slash = window.location.pathname.split( '/' );
url.hash = window.location.hash.substring( 1 );
repo.owner = url.array[0];
repo.name = url.slash[1];
if(url.slash[2]) url.page = url.slash[2];
if(url.slash[3]) url.pageowner = url.slash[3];
if(repo.owner=='127'){repo.owner='petrosh';repo.name="GFL";} // DEBUG
repo.home = "http://" + repo.owner + ".github.io/" + repo.name;
repo.API = "https://api.github.com/repos/" + repo.owner + "/" + repo.name;
repo.static = "https://rawgit.com/" + repo.owner + "/" + repo.name + "/";
function loadAssets() {
  var script = document.createElement("script");
  script.src = repo.static + "master/core/scripts/init.js";
  if(url.array[0]=='127'){script.src = "init.js";} // DEBUG
  script.type = 'text/javascript';
  document.body.appendChild(script);
  var style = document.createElement("link");
  style.href = repo.static + "master/core/styles/style.css";
  style.rel = 'stylesheet';
  document.head.appendChild(style);
}
if (window.addEventListener)
  window.addEventListener("load", loadAssets, false);
else if (window.attachEvent)
  window.attachEvent("onload", loadAssets);
else window.onload = loadAssets;