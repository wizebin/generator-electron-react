export function searchArgvForUrl(argv) {
  for (let argument of argv) {
    if (argument.indexOf('://') !== -1) {
      return argument;
    }
  }

  return null;
}
