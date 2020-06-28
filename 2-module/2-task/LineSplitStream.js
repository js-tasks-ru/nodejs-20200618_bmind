const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.text = '';
  }

  _transform(chunk, encoding, callback) {
    const arr = chunk.toString().split(os.EOL);

    if (arr.length > 1) {
      callback(null, this.text + arr.shift());
      this.text = arr[0];
    } else {
      callback(null);
      this.text += arr[0];
    }
  }

  _flush(callback) {
    callback(null, this.text);
  }
}

module.exports = LineSplitStream;
