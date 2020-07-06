const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'POST':
      const dir = __dirname + '/files';
      const pathname = url.parse(req.url).pathname.slice(1);
      const filepath = path.join(__dirname, 'files', pathname);

      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end();
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end();
      }

      const limitSizeStream = new LimitSizeStream({limit: 1048576});
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      req.on('aborted', () => {
        fs.unlink(filepath, () => res.end());
      });

      res.on('error', () => {
        res.statusCode = 500;
        res.end();
      });

      limitSizeStream.on('error', (err) => {
        if (err instanceof LimitExceededError) {
          fs.unlink(filepath, () => {
            res.statusCode = 413;
            res.end();
          });
        }
      });

      writeStream.on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end();
        }
      });

      writeStream.on('finish', (err) => {
        res.statusCode = 201;
        res.end();
      });

      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      req.pipe(limitSizeStream).pipe(writeStream);

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
