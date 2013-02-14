// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

var http = require("http");
var url = require("url");
var result = ''; 
var key;

function start(apikey, port) {
    
    key = apikey;

    function onRequest(request, response) {

        var query = url.parse(request.url, true).query;
        var path = query.path;// + '?apikey=' + key;

	// make a request to espn
	var options = {
	    //host: 'api.espn.com',
            host: 'api.twitch.tv',
            path: path,
            headers: {'Accept': 'application/json'}
	};

	callback = function(r) {
	    var str = '';
	    
	    r.on('data', function(chunk) {
		str += chunk;
	    });

	    r.on('end', function () {
		result = str;

                // write the respose back to the original recipient
		response.writeHead(200, {"Content-Type": "application/json"});
		response.write(result);
		response.end();
	    });
	}
	http.request(options, callback).end();
    }

    http.createServer(function(q, r) {
        
        // catch the annoying favicon request
	if (q.url === '/favicon.ico') {
	    r.writeHead(200, {'Content-Type': 'image/x-icon'});
	    r.end();
	    console.log('favicon caught');
	    return;
	}

	onRequest(q, r);

    }).listen(port);
}

exports.start = start;

