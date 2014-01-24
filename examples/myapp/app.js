var http = require('http');

var server = http.createServer(function (request, response) {

  response.writeHead(200, {
    "Content-Type": "text/html"
  });

  response.end([
    '<h1>This is a demo app, deployed with Dockship!</h1>',
    '<h2>Node.js version is ' + process.versions.node + '</h2>'
  ].join(''));

});

var port = process.env.PORT || 8080;
server.listen(port);

// Put a friendly message on the terminal
console.log("Server Running at http://127.0.0.1:" + port + "/");
