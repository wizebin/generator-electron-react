import { Writable } from 'stream';

export class WritableBufferStream extends Writable {
  buffer = Buffer.alloc(0);
  constructor(callback, options) {
    super(options);
    this.callback = callback;
  }

  _write(chunk, encoding, callback) {
    if (chunk) {
      this.buffer = Buffer.concat([this.buffer, chunk]);
    }

    callback();
  }

  _final(callback) {
    this.callback(this.buffer);
    callback();
  }

  _destroy() {
    this.buffer = null;
  }
}
