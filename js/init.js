// init.js

var urlSlash = window.location.pathname.split('/'),
    urlArray = window.location.host.split('.'),
    repoName = urlSlash[1],
    repoOwner = urlArray[0],
    repoFullname = repoOwner + '/' + repoName,
    repoAPI = 'https://api.github.com/repos/' + repoFullname,
    repoHome = 'http://' + repoOwner + '.github.io/' + repoName,
    rawStatic = 'https://rawgit.com/' + repoFullname,
    rawCdn = 'https://cdn.rawgit.com/' + repoFullname;

function rawgitUrl(branch){
  if(sessionStorage[ branch + 'Ref' ]) return rawCdn + '/' + sessionStorage[ branch + 'Ref' ]; else return rawStatic + '/' + branch;
}

function loadAssets(){
  domAppend({ tag: 'link', parent: 'head', attributes: { href: rawgitUrl('master') + '/styles/style.css', rel: 'stylesheet' } });
  domAppend({ tag: 'script', parent: 'body', attributes: { src: rawgitUrl('master') + '/scripts/loader.js', type: 'text/javascript' } });
}

function domAppend(obj){
  var element = document.createElement(obj.tag);
  if(obj.hasOwnProperty('attributes')){
    for (var key in obj.attributes) {
      if (obj.attributes.hasOwnProperty(key)) {
        element.setAttribute(key, obj.attributes[key]);
      }
    }
  }
  if(obj.hasOwnProperty('innerHTML')) element.innerHTML = obj.innerHTML;
  if(obj.hasOwnProperty('class')) element.classList.add(obj.class);
  if(obj.hasOwnProperty('parent')){
    if(typeof obj.parent == 'string') return document.querySelector(obj.parent).appendChild(element); else return obj.parent.appendChild(element);
  }else return element;
}

// init
if (window.addEventListener)
  window.addEventListener('load', loadAssets, false);
else if (window.attachEvent)
  window.attachEvent('onload', loadAssets);
else window.onload = loadAssets;
