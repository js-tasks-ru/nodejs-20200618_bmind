const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #size = 0;
  #limit;

  constructor(options) {
    super({ encoding: 'utf-8', ...options });
    this.#limit = options && options.limit;
  }

  _transform(chunk, encoding, callback) {
    this.#size += chunk.length;

    if (this.#size > this.#limit) return callback(new LimitExceededError());

    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
