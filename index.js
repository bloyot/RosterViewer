// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

var server = require("./server");
var fs = require('fs');

var port = process.env.PORT || 8888;

server.start(port);
