// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

var http = require("http");
var url = require("url");
var nba_scraper = require('./nba_scraper').nba_scraper;
var result = ''; 

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
           
            // cache this TODO 
            nba_scraper.get_teams(response);
            return;
        }

        // make request to get stats
        if (parsed_url.pathname === '/stats') {
            
            var team = parsed_url.query.team;
            nba_scraper.get_stats(team, response);
            return;
        }

        // change so it has its own check rather than defaulting on '/' path TODO
    
	var query = parsed_url.query;
        var sport = query.sport;	
        var team = query.team;

        // check sport, and make request
        if (sport === 'basketball') {
            nba_scraper.get_roster(team, response);     
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

