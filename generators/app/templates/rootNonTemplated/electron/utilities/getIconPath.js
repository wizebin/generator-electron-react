import path from 'path';
import getDistPath from './getDistPath';

export function getIconPath(filename) {
  const iconPath = path.join(getDistPath(), 'resources', filename);

  return iconPath;
}
