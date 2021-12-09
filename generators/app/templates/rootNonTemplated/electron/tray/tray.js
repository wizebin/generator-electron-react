import { Tray, Menu } from 'electron';
import getIcon from '../utilities/getIcon';
import packagejson from '../../package.json';

export function createTray({ showWindow, quit, ...rest }) {
  const iconImage = getIcon('icon.png', 16, 16);
  const tray = new Tray(iconImage);
  const template = [
    { icon: iconImage, label: 'Show Program', click: showWindow },
  ];
  const otherKeys = Object.keys(rest);
  for (let key of otherKeys) {
    template.push({ label: key, click: rest[key] });
  }
  template.push({ label: 'Quit', accelerator: 'Command+Q', click: quit });
  const contextMenu = Menu.buildFromTemplate(template);

  tray.setToolTip(packagejson.description);
  tray.setContextMenu(contextMenu);

  tray.on('click', function() {
    tray.popUpContextMenu();
  });

  return tray;
}
