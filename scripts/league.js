// league.js

var leagueSlug = false;

if (urlHash && urlHash.slice(0,7) === 'league=') leagueSlug = urlHash.slice(7);

var leagueObj = jsonLeagues.filter(function (obj) {
  return obj.slug == leagueSlug;
});

if (leagueObj.length) showLeagues(leagueObj);
console.log(leagueObj);
