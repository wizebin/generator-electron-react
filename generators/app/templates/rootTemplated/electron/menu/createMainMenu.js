import { Menu, shell, app } from 'electron';
import { checkForAppUpdate } from '../utilities/update';
import { isWindows } from '../utilities/platform';
import packageJson from '../../package.json';

export default function createMainMenu() {
  const win = isWindows();
  const menu = Menu.buildFromTemplate([{
    label: '<%= name %>',
    submenu: [
      ...(win ? [] : [{ role: 'about' }]),
      { type: 'separator' },
      { role: 'close' },
      { role: 'quit' },
    ]
  }, {
    role: 'editMenu',
  }, {
    role: 'viewMenu',
  }, {
    role: 'windowMenu',
  }, {
    label: 'Help',
    submenu: [
      { label: 'Website', click: () => shell.openExternal('<%= homepage %>') },
      { label: 'Relaunch', click: () => { app.relaunch(); app.exit(0) } },
      { label: `Version ${packageJson.version}`, click: checkForAppUpdate },
    ]
  }]);

  Menu.setApplicationMenu(menu);

  return menu;
}
