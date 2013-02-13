// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

var server = require("./server");
var fs = require('fs');

var apikey = process.env.apikey || '';
var port = process.env.PORT || 8888;

server.start(apikey, port);

/*
fs.readFile('apikey.txt', 'ascii', function(err, data) {
   
    if (err) {
        return console.log(err);
    }
 
    // slice off the return line char and pass in the key
    var key = data.slice(0, data.length-1);
    server.start(key);
});
*/

