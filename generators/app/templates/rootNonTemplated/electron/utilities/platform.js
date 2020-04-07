export function isWindows() {
  return process.platform === 'win32' || process.platform === 'win64';
}

export function isMac() {
  return process.platform === 'darwin';
}
