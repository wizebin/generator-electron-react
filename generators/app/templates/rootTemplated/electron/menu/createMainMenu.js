import { Menu, shell, app } from 'electron';
import { checkForAppUpdate } from '../utilities/update';
import { isWindows } from '../utilities/platform';
import packageJson from '../../package.json';
import { relaunchMain } from '../utilities/relaunchMain';

export default function createMainMenu(mainApp) {
  const win = isWindows();

  let inspectorLabel;

  if (process.argv.includes('--inspect')) {
    inspectorLabel = { label: 'Show Inspector', click: () => mainApp.showInspectorWindow() };
  } else {
    inspectorLabel = { label: 'Restart Inspectable', click: () => {
      app.relaunch({ args: process.argv.slice(1).concat(['--inspect']) })
      app.exit(0)
    } };
  }

  const helpMenu = {
    label: win ? 'File' : '<%= name %>',
    submenu: [
      { label: 'Website', click: () => shell.openExternal('<%= homepage %>') },
      { label: 'Show Basic Data', click: () => mainApp.showBasicInfo() },
      inspectorLabel,
      { label: 'Relaunch', click: relaunchMain },
      { label: 'Relaunch Renderer', click: () => mainApp.reloadRenderer() },
      { label: 'Show Loaded Url', click: () => mainApp.showLoadedUrl() },
      { label: `Version ${packageJson.version}`, click: checkForAppUpdate },
    ]
  };

  const menu = Menu.buildFromTemplate([{
    label: win ? 'File' : 'nexuscript',
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
  },
    helpMenu,
  ]);

  Menu.setApplicationMenu(menu);

  return menu;
}
