// Author: Brendan Loyot
// Application: Roster Viewer
// 2/13/13

var server = require("./server");
var fs = require('fs');

var cert = process.env.cert || fs.readFileSync('keys/certificate.pem');
var key = process.env.privatekey || fs.readFileSync('keys/privatekey.pem');
var port = process.env.PORT || 8888;

var options = {
    cert: cert,
    key: key
};

server.start(options, port);
