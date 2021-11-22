import https from 'https';
import http from 'http';
import fs from 'fs';
import ProgressPipe from './progressPipe';
import encodeUriObject from './encodeUriObject';
import { WritableBufferStream } from './WritableBufferStream';

const writeMethods = new Set(['PUT', 'POST']);

export function makeRequestForData(fullUrl, { body, method, headers, meta, streamSize, progressCallback, onData, onClose, responsePipe } = {}) {
  let promiseOut;
  const promise = new Promise((resolve, reject) => promiseOut = ({ resolve, reject }));
  const requestBase = fullUrl.startsWith('https:') ? https : http;
  console.log('requesting', fullUrl, headers);
  const fullHeaders = headers || {};
  const upperMethod = (method || 'GET').toUpperCase();
  const bodyIsStream = typeof body?.pipe === 'function';
  let knownLength = streamSize || body?.length || body?.size || 0;
  let bodyToSend = body;

  if (writeMethods.has(upperMethod)) {
    if (bodyIsStream) {
      if (streamSize !== undefined) {
        fullHeaders['Content-Length'] = streamSize;
      } else if (body.length !== undefined) {
        fullHeaders['Content-Length'] = body.length;
      } else {
        throw new Error('Must include streamSize if your body is a stream');
      }
    }

    if (!Buffer.isBuffer(body) && !bodyIsStream && typeof body === 'object') {
      const stringified = JSON.stringify(body);
      fullHeaders['Content-Type'] = 'application/json';
      fullHeaders['Content-Length'] = stringified.length;
      bodyToSend = stringified;
    }
  } else if (body) {
    fullUrl += `?${encodeUriObject(body)}`;
  }

  const request = requestBase.request(fullUrl, { method: upperMethod, headers: fullHeaders }, (response) => {
    if (responsePipe) {
      response.pipe(responsePipe);

      response.on('end', () => {
        console.log('request finishing', response.statusCode);
        progressCallback?.({ done: true, completed: request.socket.bytesWritten, total: knownLength, meta });
        promiseOut.resolve(onClose(response, meta));
      });
    } else {
      response.on('data', data => {
        onData?.(data);
      });

      response.on('end', () => {
        console.log('request finishing', response.statusCode);
        progressCallback?.({ done: true, completed: request.socket.bytesWritten, total: knownLength, meta });
        promiseOut.resolve(onClose(response, meta));
      });
    }

  });

  request.on('drain', () => {
    progressCallback?.({ done: false, completed: request.socket.bytesWritten, total: knownLength, meta });
  });

  request.on('error', (err) => {
    promiseOut.reject(err);
  });

  if (writeMethods.has(upperMethod)) {
    if (bodyIsStream) {
      body.on('end', () => {
        console.log('ending request');
        request.end();
      });

      body.pipe(request);
    } else {
      request.write(bodyToSend, () => {
        request.end();
      });
    }
  } else {
    request.end();
  }

  promise.abort = () => {
    request.abort();
  };

  return promise;
}

export async function makeRequest(url, params = {}) {
  let fullData = Buffer.alloc(0);
  const output = new WritableBufferStream((data) => {
    fullData = data;
  });

  params.responsePipe = output;

  const response = await streamRequest(url, params);

  return { status: response.status, data: fullData.toString(), headers: response.headers };
}

export function downloadRequest(url, localPath, params = {}) {
  const localStream = fs.createWriteStream(localPath);
  params.responsePipe = localStream;
  return streamRequest(url, params);
}

export async function makeJsonRequest(...requestingParameters) {
  const baseResults = await makeRequest(...requestingParameters);
  const { status, data, headers, meta } = baseResults;

  try {
    return {
      status, headers, meta,
      data: data ? JSON.parse(data) : null,
    };
  } catch (err) {
    console.log('non json output', err, requestingParameters, data);
    throw (err);
  }
}

export async function makeRawRequest(...requestingParameters) {
  const baseResults = await makeRequest(...requestingParameters);
  const { status, data, headers, meta } = baseResults;

  return {
    status, headers, meta, data,
  };
}

export function streamRequest(fullUrl, { body, method, headers, meta, streamSize, progressCallback, responsePipe } = {}, redirects = 0) {
  const requestBase = fullUrl.startsWith('https:') ? https : http;
  const fullHeaders = headers || {};
  const upperMethod = (method || 'GET').toUpperCase();
  const bodyIsStream = typeof body?.pipe === 'function';
  let knownLength = streamSize || body?.length || body?.size || 0;
  let bodyToSend = body;

  if (writeMethods.has(upperMethod)) {
    if (bodyIsStream) {
      if (streamSize !== undefined) {
        fullHeaders['Content-Length'] = streamSize;
      } else if (body.length !== undefined) {
        fullHeaders['Content-Length'] = body.length;
      } else {
        throw new Error('Must include streamSize if your body is a stream');
      }
    }

    if (!Buffer.isBuffer(body) && !bodyIsStream && typeof body === 'object') {
      const stringified = JSON.stringify(body);
      fullHeaders['Content-Type'] = 'application/json';
      fullHeaders['Content-Length'] = stringified.length;
      bodyToSend = stringified;
    }
  } else if (body) {
    fullUrl += `?${encodeUriObject(body)}`;
  }

  let abort;
  const resultPromise = new Promise((resolve, reject) => {
    const request = requestBase.request(fullUrl, { method: upperMethod, headers: fullHeaders, timeout: 5000 }, (response) => {

      if (response.statusCode === 301 || response.statusCode === 302) {
        if (redirects < 5) {
          console.log('redirecting', response.headers.location);
          return resolve(streamRequest(response.headers.location, { method, headers, meta, streamSize, progressCallback, responsePipe }, redirects + 1));
        } else {
          return reject(new Error('Too many redirects'));
        }
      }

      const rawDownloadLength = response?.headers?.['content-length'];
      const downloadLength = (rawDownloadLength ? parseInt(rawDownloadLength) : 1) || 1;
      const progress = new ProgressPipe((written) => {
        progressCallback?.({ done: false, completed: written, total: downloadLength, meta });
      });
      response.pipe(progress).pipe(responsePipe);

      responsePipe.on('finish', () => {
        console.log('out pipe finishing');
        progressCallback?.({ done: true, completed: request.socket.bytesWritten, total: knownLength, meta });
        resolve({ status: response.statusCode, headers: response.headers });
      });

      response.on('error', err => {
        console.log('pipe error', err);
        reject(err);
      });
    });

    abort = () => {
      request.abort();
    };

    request.on('drain', () => {
      progressCallback?.({ done: false, completed: request.socket.bytesWritten, total: knownLength, meta });
    });

    request.on('error', (err) => {
      reject(err);
    });

    if (writeMethods.has(upperMethod)) {
      if (bodyIsStream) {
        body.on('end', () => {
          let closed = false;
          request.end(() => {
            closed = true;
          });
          setTimeout(() => {
            console.log('closing', closed ? 'succeeded' : 'failed');
            if (!closed) {
              console.log('failed to close, aborting');
              abort();
            }
          }, 3000);
        });

        body.pipe(request);
      } else {
        request.write(bodyToSend, () => {
          request.end(() => {
            console.log('request.end callback');
          });
        });
      }
    } else {
      request.end();
    }
  });

  resultPromise.abort = abort;

  return resultPromise;
}
