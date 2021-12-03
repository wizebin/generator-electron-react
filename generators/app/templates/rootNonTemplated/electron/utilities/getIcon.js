import { nativeImage } from 'electron';
import { getIconPath } from './getIconPath';
import getQuestionBuffer from '../resources/questionPngBuffer';

export default function getIcon(iconName, width, height) {
  const iconPath = getIconPath(iconName);
  let iconImage = nativeImage.createFromPath(iconPath);

  if (!iconImage || iconImage.isEmpty()) {
    iconImage = nativeImage.createFromBuffer(getQuestionBuffer());
  }

  if (width !== undefined && height !== undefined) {
    iconImage = iconImage.resize({ width, height });
  }

  return iconImage;
}
