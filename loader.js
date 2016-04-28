// loader.js

function FnP(){
  this.url = { /* this page url */ };
  this.url.array = window.location.host.split( '.' );
  this.url.slash = window.location.pathname.split( '/' );
  this.url.hash = window.location.hash.substring( 1 );
  this.url.page = (this.url.slash[2]) ? this.url.slash[2]: false;
  this.url.setup = (this.url.slash[3]) ? this.url.slash[3]: false;
  this.repo = { /* this page repository */ };
  this.repo.owner = this.url.array[0];
  this.repo.name = this.url.slash[1];
  this.repo.home = "http://" + this.repo.owner + ".github.io/" + this.repo.name;
  this.repo.API = "https://api.github.com/repos/" + this.repo.owner + "/" + this.repo.name;
  this.repo.static = "https://rawgit.com/" + this.repo.owner + "/" + this.repo.name + "/";
  this.repo.cdn = "https://cdn.rawgit.com/" + this.repo.owner + "/" + this.repo.name + "/";
  this.repo.data = { /* branch */ };
  this.repo.team = { /* repo team */ };
}

var fnp = new FnP();

function loadAssets() {
  var script = document.createElement("script");
  script.src = fnp.repo.static + "master/scripts/init.js";
  script.type = 'text/javascript';
  document.body.appendChild(script);
  if((fnp.url.page && fnp.url.page == 'setup') || (fnp.url.page && fnp.url.setup)){
    var jsoneditor = document.createElement("script");
    jsoneditor.src = fnp.repo.static + "master/scripts/jsoneditor.js";
    jsoneditor.type = 'text/javascript';
    document.body.appendChild(jsoneditor);
  }
  var style = document.createElement("link");
  style.href = fnp.repo.static + "master/styles/style.css";
  style.rel = 'stylesheet';
  document.head.appendChild(style);
}
if (window.addEventListener)
  window.addEventListener("load", loadAssets, false);
else if (window.attachEvent)
  window.attachEvent("onload", loadAssets);
else window.onload = loadAssets;
