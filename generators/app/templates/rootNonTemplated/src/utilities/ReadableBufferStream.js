import { Readable } from 'stream';

export class ReadableBufferStream extends Readable {
  sentBytes = 0;

  constructor(original, options) {
    super(options);
    this.originalBuffer = Buffer.from(original);
  }

  _read(size) {
    if (size > 0 && this.sentBytes < this.originalBuffer.length) {
      const toSend = this.originalBuffer.slice(this.sentBytes, this.sentBytes + size);
      this.push(toSend);
      this.sentBytes += toSend.length;
      if (this.sentBytes >= toSend.length) this.push(null);
    } else {
      this.push(null);
    }
  }

  _destroy() {
    this.originalBuffer = null;
  }
}
