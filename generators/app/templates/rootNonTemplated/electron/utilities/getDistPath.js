import { app } from 'electron';
import path from 'path';

/**
 * In development files are loaded differently than when they are packaged
 * @param {*} subpath
 */
export default function getDistPath() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'dist');
  }

  return app.getAppPath(); // already includes the dist subfolder
}
