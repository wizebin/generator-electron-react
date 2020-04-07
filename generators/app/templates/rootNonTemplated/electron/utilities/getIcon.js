import { nativeImage } from 'electron';
import { getIconPath } from './getIconPath';
import getQuestionBuffer from '../resources/questionPngBuffer';

export default function getIcon(iconName) {
  const iconPath = getIconPath(iconName);
  let iconImage = nativeImage.createFromPath(iconPath);

  if (!iconImage || iconImage.isEmpty()) {
    iconImage = nativeImage.createFromBuffer(getQuestionBuffer());
  }

  return iconImage;
}
