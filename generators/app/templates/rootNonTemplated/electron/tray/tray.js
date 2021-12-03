import { Tray, Menu } from 'electron';
import getIcon from '../utilities/getIcon';
import packagejson from '../../package.json';

export function createTray({ showWindow, quit }) {
  const iconImage = getIcon('icon.png', 16, 16);
  const tray = new Tray(iconImage);
  const contextMenu = Menu.buildFromTemplate([
    { icon: iconImage, label: 'Show Program', click: showWindow },
    { label: 'Quit', accelerator: 'Command+Q', click: quit },
  ]);

  tray.setToolTip(packagejson.description);
  tray.setContextMenu(contextMenu);

  tray.on('click', function() {
    tray.popUpContextMenu();
  });

  return tray;
}
