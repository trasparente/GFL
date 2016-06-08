// home.js

function showLeagues(){
  for( i=0; i < jsonLeagues.length; i++ ){
    var row = document.createElement('tr');
    row.innerHTML = '<td><a href="' + repoHome + '/league/#league=' + jsonLeagues[i].slug + '">' + jsonLeagues[i].title + '</a></td>';
    domTable.appendChild(row);
  }
  domSection.appendChild(domTable);
  showReadme();
}

function showReadme(){
  apiCall({
    url: repoAPI + '/readme?ref=' + 'gh-pages',
    accept: 'application/vnd.github.v3.html',
    cb: function(){
      domAppend({ tag: 'div', parent: domSection, innerHTML: this });
    }
  });
}

if(jsonLeagues.length) showLeagues();
