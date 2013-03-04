// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

// values
var hour = 60 * 60 * 1000; // in ms

// modules
var http = require("http");
var url = require("url");

// custom modules
var nba_scraper = require('./nba_scraper').nba_scraper;

var cache = {
    teams : {}, 
    rosters : {},
    stats : {}
};

//var last_team_check = Date.now();

function start(port) {
    
    function onRequest(request, response) {

        var parsed_url = url.parse(request.url, true);
     
        // catch the annoying favicon request
	if (request.url === '/favicon.ico') {
	    response.writeHead(200, {'Content-Type': 'image/x-icon'});
	    response.end();
	    console.log('favicon caught');
	    return;
	}

        // make request to get teams
        if (request.url === '/teams') {
          
	    // if cache is emtpy, there has never been a check, or
            // it's been more than an hour, get fresh data
            if (cache.teams === undefined   
                    || cache.teams.last_check === undefined
                    || Date.now() - cache.teams.last_check > hour) {
                console.log("getting fresh teams data");
                nba_scraper.get_teams(response, cache);         
            } else {
                // else serve the cached data
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(cache.teams.data);
		response.end(); 
            }
            return;
        }

        // make request to get stats
        if (parsed_url.pathname === '/stats') {
            
            var team = parsed_url.query.team;

            // if cache is emtpy, there has never been a check, or
            // it's been more than an hour, get fresh data
            if (cache.stats[team] === undefined 
                    || cache.stats[team].last_check === undefined
                    || Date.now() - cache.stats[team].last_check > hour) {
                console.log("getting fresh teams data");
                nba_scraper.get_stats(team, response, cache);
            } else {
                // else serve the cached data
                response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(cache.stats[team].data);
		response.end();
            }
                        
            return;
        }

        // change so it has its own check rather than defaulting on '/' path TODO
	var query = parsed_url.query;
        var sport = query.sport;	
        var team = query.team;

        // check sport, and make request
        if (sport === 'basketball') {

            // if cache is emtpy, there has never been a check, or
            // it's been more than an hour, get fresh data
            if (cache.rosters[team] === undefined 
                    || cache.rosters[team].last_check === undefined
                    || Date.now() - cache.rosters[team].last_check > hour) {
                console.log("getting fresh teams data");
                nba_scraper.get_roster(team, response, cache);
            } else {
                // else serve the cached data
                response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(cache.rosters[team].data);
		response.end();
            }

                 
        }
        else {
            // write error if sport not found
            console.log("Sport not implemented yet");
            response.writeHead(200, {"Content-Type": "text/plain"});
	    response.write("sport not implemented");
            response.end();
        }
    }

    http.createServer(onRequest).listen(port);
}

exports.start = start;

