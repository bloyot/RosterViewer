// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

var https = require("https");
var url = require("url");

var ssl_options;
var result = ''; 

function start(options, port) {

    ssl_options = options;

    function onRequest(request, response) {

        var query = url.parse(request.url, true).query;
        var path = query.path; 

	// make a request to espn
	var options = {
	    host: 'api.twitch.tv',
            path: path,
            headers: {'Accept': 'application/json'}
	};

        console.log(options.host);
        console.log(options.path);

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
	https.request(options, callback).end();
    }

    https.createServer(ssl_options, function(q, r) {
        
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

