import { app, dialog } from 'electron';
import MainApp from './app/MainApp';
import { searchArgvForUrl } from './utilities/searchArgvForUrl';
import { initialize as initializeRemote } from '@electron/remote/main';

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

initializeRemote();

const mainApp = new MainApp(false);

// stop screen flashing on osx
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');

app.on('ready', mainApp.initialize);

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
