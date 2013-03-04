// Author: Brendan Loyot
// Application: RosterViewer
// 2/21/13

// Module to scrape roster info, team info and stats from nba.com, 

var nba_scraper = {}
nba_scraper.roster_fields = 8;
nba_scraper.stats_fields = 16;

nba_scraper.get_roster = function(team, parent_res, cache) {
     
    var request = require('request'),
    jsdom = require('jsdom');
  
    var cache_string = '';
 
    // http request to get the rosters 
    request({ uri:'http://www.nba.com/' + team + '/roster/' + getSeasonYear() },  
        function (error, response, body) {
	    if (error && response.statusCode !== 200) {
	      console.log('Error when contacting site ');
	    }
       
            // create the jsdom object, create a new window, and find the 
            // appropriate elements, and write them to the response
	    jsdom.env({
		html: body,
		scripts: [ 'http://code.jquery.com/jquery-1.9.1.min.js' ]
		}, function (err, window) {
		    var $ = window.jQuery;

		 var i = 0;
                 var result = "";
		 var rosters = $('.feeds-roster td');
                 
	       	 parent_res.writeHead(200, {"Content-Type": "text/plain"});

                 // loop to build the entire roster from td elements
                 // builds a whole players info then writes the result 
                 // to the response 
                 
		 while (rosters.eq(i).length) {
	             if (i % nba_scraper.roster_fields  === 1) {
			 // parse link to get name
                         result = result + rosters.eq(i).find('a').html() + " "; 
                     } else {
                         result = result + rosters.eq(i).html() + " ";   
                     }
                    
                     if (i % nba_scraper.roster_fields === nba_scraper.roster_fields-1) {
                         result = result + "\n";
			 parent_res.write(result);
                         cache_string = cache_string + result;
			 result = ""; 
                     }
                     i += 1;
		 }
		 // else cache and write response as normal 
		 cache.rosters[team] = {};
		 cache.rosters[team].data = cache_string;
		 cache.rosters[team].last_check = Date.now();       
                 parent_res.end();
                  
	    });
        });
}

nba_scraper.get_teams = function(parent_res, cache) {

    var request = require('request');

    // on callback write the body and cache the result
    var callback = function(error, response, body) {

        var JSON_body = JSON.parse(body);

        // handle error case, write back an empty string, so 
        // as not to break app
        if (JSON_body.status === "error") {
            console.log("Error, code: " + JSON_body.code + "\n" 
                    + "Message: " + JSON_body.message); 
	    parent_res.writeHead(200, {"Content-Type": "text/plain"});
	    parent_res.write("");
	    parent_res.end();  
            return;  
        }
        // else cache and write response as normal 
        cache.teams = {};
        cache.teams.data = body;
        cache.teams.last_check = Date.now();

	parent_res.writeHead(200, {"Content-Type": "text/plain"});
	parent_res.write(body);
	parent_res.end();
    }

    // make the request
    request({ uri: 'http://api.espn.com/v1/sports/basketball/nba/teams?apikey='
	    + process.env.apikey }, callback);
}

nba_scraper.get_stats = function(team, parent_res, cache) {

    var request = require('request'),
    jsdom = require('jsdom');
   
    // http request to get the teams 
    request({ uri:'http://www.nba.com/' + team + '/stats/' + getSeasonYear() },  
        function (error, response, body) {
	    if (error && response.statusCode !== 200) {
	      console.log('Error when contacting site ');
	    }
       
            // create the jsdom object, create a new window, and find the 
            // appropriate elements, and write them to the response
	    jsdom.env({
		html: body,
		scripts: [ 'http://code.jquery.com/jquery-1.9.1.min.js' ]
		}, function (err, window) {
		    var $ = window.jQuery;

		 var i = 0, rosters;
                 var result = "";
                 var cache_string = "";
		 rosters = $('.feeds-stats td');
                 
	         parent_res.writeHead(200, {"Content-Type": "text/plain"});
                 
                 // loop through the table, building each players stat line field
                 // by field
                 while (rosters.eq(i).length) {
                     
                     // the first td is a link, so parse it for the name
                     if (i % nba_scraper.stats_fields === 0) {
                          // if the first word isn't a link, you've reached the 
                          // end of players
                          if (typeof (rosters.eq(i).find('a').html()) === "undefined") {
                              break;
                          }
		          result = result + rosters.eq(i).find('a').html() + " ";
		     } else {
                         // build the resulting string
			 result = result + rosters.eq(i).html() + " ";
                     }
                     // if you reach the last field, add a CR, write the result and reset
                     if (i % nba_scraper.stats_fields === nba_scraper.stats_fields-1) {
                         result = result + "\n";
                         parent_res.write(result);
                         cache_string = cache_string + result;
                         result = "";
                     }
		     i += 1; 
                 }
                 cache.stats[team] = {};
                 cache.stats[team].data = cache_string;
                 cache.stats[team].last_check = Date.now();
                 parent_res.end();
	    });
        });
}

// helper functions

// Gets the year to use for the nba.com requests.
// This is the year when the season started, so in december of 
// 2012 this is 2012, but then next month in january 2013 it is still 2012,
// up until halfway through oct, right before the new season starts
function getSeasonYear() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var day = now.getDate();

    if (month >= 0 && month < 9) {
        return (year-1);
    }
    if (month === 9 && day < 20) {
        return (year-1);
    }
    return year;
}

exports.nba_scraper = nba_scraper; 

