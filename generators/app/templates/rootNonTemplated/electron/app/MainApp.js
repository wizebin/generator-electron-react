import path from 'path';
import fs from 'fs';
import getDistPath from '../utilities/getDistPath';
import { BrowserWindow, app, dialog } from 'electron';
import uuid from 'uuid/v4';
import { isWindows } from '../utilities/platform';
import { autoUpdater } from 'electron-updater';
import createMainMenu from '../menu/createMainMenu';
import { checkForAppUpdate } from '../utilities/update';
import builderJson from '../../electron-builder.json';
import { searchArgvForUrl } from '../utilities/searchArgvForUrl';
import { relaunchMain } from '../utilities/relaunchMain';

export default class MainApp {
  mainwindow = null;
  subwindows = {};
  tray = null;
  deepLinkUrl = null;

  loadUrlWhenAvailable = async (indexPath, maxRetries = 50, timeoutPerRetry = 100) => {
    for (let dex = 0; dex < maxRetries; dex += 1) {
      try {
        await this.mainwindow?.loadURL(indexPath);
        break;
      } catch (err) {
        console.log('failed to load main url (probably still initializing)');
        await new Promise(resolve => setTimeout(resolve, timeoutPerRetry));
      }
    }
  }

  initializeDeepLinking = (linkProtocol) => {
    const protocolToUse = linkProtocol || builderJson?.protocols?.schemes?.[0];
    if (!app.isDefaultProtocolClient(protocolToUse)) {
      app.setAsDefaultProtocolClient(protocolToUse);
    }

    const foundDeepLink = searchArgvForUrl(process.argv);
    if (foundDeepLink) {
      this.onDeepLinkUrl(foundDeepLink);
    }
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.onDeepLinkUrl(url);
    });
  }

  onDeepLinkUrl = (url) => {
    this.deepLinkUrl = url;
    this.sendDeepLinkUrl();
  }

  sendDeepLinkUrl = (url) => {
    if (this.appReady) {
      this.sendMessageToMainWindow('deep-link', url || this.deepLinkUrl);
      return true;
    }

    return false;
  }

  createMainWindow = (indexPath = process.env.HTML_SERVER_URL) => {
    if (this.mainwindow) {
      return this.mainwindow;
    }

    this.initializeDeepLinking();

    this.mainwindow = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: { nodeIntegration: true, enableRemoteModule: true, worldSafeExecuteJavaScript: true, contextIsolation: false },
      show: false, // wait until page is loaded
    });

    this.menu = createMainMenu();

    this.mainwindow.once('ready-to-show', () => {
      this.mainwindow.show();
    });

    this.mainwindow.webContents.on('ipc-message', this.onIpcMessageFromRenderer);

    this.mainwindow.on('render-process-gone', (event, details) => {
      const { reason } = details;

      console.log('renderer process gone', reason);

      const descriptions = {
        'clean-exit': 'Process exited with an exit code of zero',
        'abnormal-exit': 'Process exited with a non-zero exit code',
        'killed': 'Process was sent a SIGTERM or otherwise killed externally',
        'crashed': 'Process crashed',
        'oom': 'Process ran out of memory',
        'launch-failed': 'Process never successfully launched',
        'integrity-failure': 'Windows code integrity checks failed',
      };

      const badSet = new Set(['abnormal-exit', 'crashed', 'oom', 'launch-failed', 'integrity-failure']);

      if (badSet.has(reason)) {
        dialog.showMessageBox({ type: 'error', title: descriptions[reason], buttons: ['Relaunch', 'Exit'] }).then((buttonIndex) => {
          if (buttonIndex === 0) {
            relaunchMain();
          }
        });
      }
    });

    this.mainwindow.uuid = uuid();
    if (indexPath) {
      this.loadUrlWhenAvailable(indexPath);
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
      this.appReady = false;
      this.mainwindow = null;
    });
    return this.mainwindow;
  }

  createOrShowMainWindow = (deepLinkUrl) => {
    if (deepLinkUrl) {
      this.onDeepLinkUrl(deepLinkUrl);
    }

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
      return true;
    }

    return false;
  }

  onIpcMessageFromRenderer = (event, channel, ...args) => {
    console.log('got ipc message in main', channel);
    if (channel === 'app-ready') {
      this.appReady = true;
      this.sendDeepLinkUrl();
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
