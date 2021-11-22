import stream from 'stream';

export default class ProgressPipe extends stream.Transform {
  constructor(onProgress) {
    super();
    this.onProgress = onProgress;
  }

  progress = 0;

  _transform(data, encoding, callback) {
    if (data) {
      this.progress += data.length;
      this.onProgress(this.progress);
    }
    this.push(data);
    callback();
  }
}
