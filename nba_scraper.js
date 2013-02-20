// Author: Brendan Loyot
// Application: RosterViewer
// 2/21/13

// Module to scrape roster info from a sports website, takes a team, 
// and the response to write to 

var nba_scraper = {}

nba_scraper.get_roster = function (team, parent_res) {
     
    var request = require('request'),
    jsdom = require('jsdom');
   
    // http request to get the rosters 
    request({ uri:'http://www.eskimo.com/~pbender/rosters.html' }, 
        function (error, response, body) {
	    if (error && response.statusCode !== 200) {
	      console.log('Error when contacting site ');
	    }
       
            // create the jsdom object, create a new window, and find the 
            // appropriate elements, and write them to the response
	    jsdom.env({
		html: body,
		scripts: [ 'http://code.jquery.com/jquery-1.5.min.js' ]
		}, function (err, window) {
		    var $ = window.jQuery;

		 var i = 0, teams, rosters;
		 teams = $('a');
		 rosters = $('pre');
		 
                 // loop while looking for the right team 
		 while (teams.eq(i).length) {
		     if (teams.eq(i++).html() === team) {
                        parent_res.writeHead(200, {"Content-Type": "text/plain"});
		        parent_res.write(rosters.eq(i++).html());
			parent_res.end();
                        return;
		     }
		 }
                  
                 // handle case where you don't find the team 
                 parent_res.writeHead(200, {"Content-Type": "text/plain"});
		 parent_res.write("no team found");
		 parent_res.end();

	    });
        });
}

exports.nba_scraper = nba_scraper; 

