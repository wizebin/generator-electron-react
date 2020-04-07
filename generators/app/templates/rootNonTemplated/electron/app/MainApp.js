import path from 'path';
import fs from 'fs';
import getDistPath from '../utilities/getDistPath';
import { BrowserWindow, app, dialog } from 'electron';
import uuid from 'uuid/v4';
import { isWindows } from '../utilities/platform';
import { autoUpdater } from 'electron-updater';
import createMainMenu from '../menu/createMainMenu';
import { checkForAppUpdate } from '../utilities/update';

export default class MainApp {
  mainwindow = null;
  subwindows = {};
  tray = null;

  createMainWindow = (indexPath = process.env.HTML_SERVER_URL) => {
    if (this.mainwindow) {
      return this.mainwindow;
    }

    this.mainwindow = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: { nodeIntegration: true },
      show: false, // wait until page is loaded
    });

    this.menu = createMainMenu();

    this.mainwindow.once('ready-to-show', () => {
      this.mainwindow.show();
    });

    this.mainwindow.uuid = uuid();
    if (indexPath) {
      this.mainwindow.loadURL(indexPath);
    } else {
      const htmlPath = path.join(getDistPath(), 'renderer', 'index.html');
      if (!fs.existsSync(htmlPath)) {
        const messageBoxOptions = { type: 'error', title: 'Could not load index.html, is the path correct?' };
        dialog.showMessageBox(messageBoxOptions).then(() => {
          process.exit(1);
        });
      }
      this.mainwindow.loadFile(htmlPath);
    }

    if (isWindows()) {
      this.mainwindow.on('close', (event) => {
        process.exit(0);
      });
    }

    this.mainwindow.on('closed', () => {
      this.mainwindow = null;
    });
    return this.mainwindow;
  }

  createOrShowMainWindow = () => {
    if (!this.mainwindow) {
      this.createMainWindow();
    } else {
      this.mainwindow.show();
      this.mainwindow.focus();
    }
  }

  quit = () => {
    app.quit();
  }

  showOptionDialog = (message, options) => {
    if (isWindows()) this.createOrShowMainWindow();
    const optionStrings = options.map(item => item.title);
    const chosen = isWindows() && this.mainwindow ? dialog.showMessageBoxSync(this.mainwindow, { message, buttons: optionStrings }) : dialog.showMessageBoxSync({ message, buttons: optionStrings });
    return options[chosen].action();
  }

  sendMessageToMainWindow = (type, data) => {
    if (this.mainwindow) {
      this.mainwindow.webContents.send(type, data);
    }
  }

  log = (...data) => {
    this.sendMessageToMainWindow('consolelog', { data });
    if (this.oldConsoleLog) {
      this.oldConsoleLog(...data);
    }
  }

  monkeyPatchConsoleLog = () => {
    if (!this.oldConsoleLog) {
      this.oldConsoleLog = console.log;
      console.log = this.log;
    }
  }

  restoreMonkeyPatchedConsoleLog = () => {
    if (this.oldConsoleLog) {
      console.log = this.oldConsoleLog;
      this.oldConsoleLog = null;
    }
  }

  startAutoUpdater = () => {
    autoUpdater.on('checking-for-update', () => {
      this.sendMessageToMainWindow('auto_update', 'Checking for update...');
    });
    autoUpdater.on('update-available', (/* info */) => {
      this.sendMessageToMainWindow('auto_update', 'Update available.');
    });
    autoUpdater.on('update-not-available', (/* info */) => {
      this.sendMessageToMainWindow('auto_update', 'Update not available.');
    });
    autoUpdater.on('error', (err) => {
      this.sendMessageToMainWindow('auto_update', 'Error in auto-updater. ' + err);
    });
    autoUpdater.on('download-progress', (progress) => {
      const message = `Download Speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred}/${progress.total})`;
      this.sendMessageToMainWindow('auto_update', message);
    });
    autoUpdater.on('update-downloaded', (/* info */) => {
      this.sendMessageToMainWindow('auto_update', 'Update downloaded');
    });

    checkForAppUpdate();
  }

  initialize = () => {
    this.monkeyPatchConsoleLog();
    this.createOrShowMainWindow();
    this.startAutoUpdater();
  }
}
