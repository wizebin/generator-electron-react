import { app, dialog } from 'electron';

import MainApp from './app/MainApp';
import { isMac } from './utilities/platform';
import { searchArgvForUrl } from './utilities/searchArgvForUrl';
import { initialize as initializeRemote } from '@electron/remote/main';

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

initializeRemote();

const mainApp = new MainApp();

// stop screen flashing on osx
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');

app.on('ready', mainApp.initialize);

// close the application in anything other than osx
app.on('window-all-closed', () => {
  if (!isMac()) {
    process.exit(0);
  }
});

app.on('activate', () => {
  mainApp.createOrShowMainWindow();
});

app.on('second-instance', (event, secondInstanceArgv, workingDirectory) => {
  mainApp.createOrShowMainWindow(searchArgvForUrl(secondInstanceArgv));
});

app.on('will-finish-launching', () => {
  mainApp.initializeDeepLinking();
});

process.on('uncaughtException', function (err) {
  const messageBoxOptions = { type: 'error', title: 'Error in Main process', message: err.stack || 'Unknown error' };
  dialog.showMessageBox(messageBoxOptions).then(() => {
    process.exit(1);
  });
});
