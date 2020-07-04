const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end();
      }

      fs.readFile(filepath, (err, data) => {
        if (err && err.code === 'ENOENT') {
          res.statusCode = 404;
        } else if (err) {
          res.statusCode = 500;
        } else {
          res.write(data);
        }

        res.end();
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
