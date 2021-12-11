import { nativeImage } from 'electron';

export function resizedNativeImageFromImported(imported, width, height) {
  const intermediary = nativeImage.createFromBuffer(Buffer.from(imported));
  return intermediary.resize({ width, height });
}
