import { isObject, keys } from 'lodash';

export default function encodeUriObject(obj) {
  if (!obj) return '';
  return keys(obj).reduce((culm, key) => {
    if (key !== undefined && obj[key] !== undefined) {
      if (isObject(obj[key])) {
        culm.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(obj[key]))}`);
      } else {
        culm.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
      }
    }

    return culm;
  }, []).join('&');
}
