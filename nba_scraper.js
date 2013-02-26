// Author: Brendan Loyot
// Application: RosterViewer
// 2/21/13

// Module to scrape roster info from a sports website, takes a team, 
// and the response to write to 

var nba_scraper = {}

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

		 var i = 0, rosters;
                 var result = "";
		 rosters = $('.feeds-roster td');
                 
	       	 parent_res.writeHead(200, {"Content-Type": "text/plain"});

                 // loop to build the entire roster from td elements
                 // builds a whole players info then writes the result 
                 // to the response 
		 while (rosters.eq(i).length) {
	             if (i % 8  === 1) {
			 // parse link to get name
                         result = result + rosters.eq(i).find('a').html() + " "; 
                     } else {
                         result = result + rosters.eq(i).html() + " ";   
                     }
                    
                     if (i % 8 === 7) {
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

