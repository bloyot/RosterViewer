// Author: Brendan Loyot
// Application: RosterViewer
// 2/21/13

// Module to scrape roster info, team info and stats from nba.com, 

var nba_scraper = {}
nba_scraper.roster_fields = 8;
nba_scraper.stats_fields = 16;

nba_scraper.get_roster = function(team, parent_res) {
     
    var request = require('request'),
    jsdom = require('jsdom');
   
    // http request to get the rosters, change 2012 to variable TODO, 
    request({ uri:'http://www.nba.com/' + team + '/roster/2012' },  
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
			 result = ""; 
                     }
                     i += 1;
		 }
                
                 parent_res.end();
                  
	    });
        });
}

nba_scraper.get_teams = function(parent_res) {

    var http = require('http'); 

    var options = {
        host: 'api.espn.com',
	path: '/v1/sports/basketball/nba/teams?apikey=' + process.env.apikey
    };  

    callback = function(response) {
	var result = '';

	//another chunk of data has been recieved, so append it to `str`
	response.on('data', function (chunk) {
	  result += chunk;
	});

	//the whole response has been recieved, so we just print it out here
	response.on('end', function () {
	    parent_res.writeHead(200, {"Content-Type": "text/plain"});
            parent_res.write(result);
            parent_res.end();
        });
    } 

    http.request(options, callback).end(); 
}

nba_scraper.get_stats = function(team, parent_res) {

    var request = require('request'),
    jsdom = require('jsdom');
   
    // http request to get the teams, change 2012 to variable TODO, 
    request({ uri:'http://www.nba.com/' + team + '/stats/2012' },  
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
                         result = "";
                     }
		     i += 1; 
                 }

                 parent_res.end();
	    });
        });
}

exports.nba_scraper = nba_scraper; 

