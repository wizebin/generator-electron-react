import path from 'path';
import fs from 'fs';
import getDistPath from '../utilities/getDistPath';
import { BrowserWindow, app, dialog } from 'electron';
import { v4 as uuid } from 'uuid';
import { isMac, isWindows } from '../utilities/platform';
import { autoUpdater } from 'electron-updater';
import createMainMenu from '../menu/createMainMenu';
import { checkForAppUpdate } from '../utilities/update';
import builderJson from '../../electron-builder.json';
import { searchArgvForUrl } from '../utilities/searchArgvForUrl';
import { relaunchMain } from '../utilities/relaunchMain';
import { makeJsonRequest } from '../../src/utilities/makeRequest';
import { createTray } from '../tray/tray';

async function loadUrlWhenAvailable(subjectWindow, indexPath, maxRetries = 50, timeoutPerRetry = 100) {
  for (let dex = 0; dex < maxRetries; dex += 1) {
    try {
      await subjectWindow?.loadURL(indexPath);
      break;
    } catch (err) {
      console.log('failed to load main url (probably still initializing)');
      await new Promise(resolve => setTimeout(resolve, timeoutPerRetry));
    }
  }
}

async function loadFileOrUrl(subjectWindow, indexPath) {
  if (fs.existsSync(indexPath.replace(/^\s*file:\/\//, ''))) {
    try {
      await subjectWindow.loadFile(indexPath);
    } catch (err) {
      const messageBoxOptions = { type: 'error', title: 'Could not load index.html, is the path correct?' };
      dialog.showMessageBox(messageBoxOptions).then(() => {
        // process.exit(1);
      });
    }
  } else {
    return loadUrlWhenAvailable(subjectWindow, indexPath);
  }
}

export default class MainApp {
  mainwindow = null;
  subwindows = {};
  tray = null;
  deepLinkUrl = null;
  isTrayApp = false;

  constructor(asTrayApp = false) {
    this.isTrayApp = asTrayApp;

    app.on('before-quit', (event) => {
      if (this.isTrayApp) {
        if (!this.confirmQuitSync()) {
          event.preventDefault();
          return 0;
        } // else quitting
      }
    });

    app.on('window-all-closed', () => {
      if (this.isTrayApp) {
        this.hideDock();
      }
    });
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

  getLoadedUrl = () => {
    return this.loadedPath;
  }

  showLoadedUrl = () => {
    dialog.showMessageBox({ type: 'info', message: `Loaded URL: ${this.mainwindow?.webContents?.getURL?.()}` });
  }

  reloadRenderer = () => {
    return loadFileOrUrl(this.mainwindow, this.mainwindow?.primaryPath);
  }

  showInspectorWindow = async (port = 9229) => {
    const rawInfoUrl = `http://127.0.0.1:${port}/json`;
    try {
      const rawInfo = await makeJsonRequest(rawInfoUrl);
      const info = await rawInfo.data?.[0];
      const { description, devtoolsFrontendUrl, devtoolsFrontendUrlCompat, faviconUrl, id, title, type, url, webSocketDebuggerUrl } = info;

      if (devtoolsFrontendUrl) {
        this.createWindow(devtoolsFrontendUrl);
      } else {
        dialog.showMessageBox({ type: 'error', message: `Could not inspect ${port}, you may need to rerun your node program with --debug or --inspect, (${rawInfo.status}, ${rawInfo.data})` });
      }
    } catch (err) {
      dialog.showMessageBox({ type: 'error', message: `Failed to inspect ${port}, you may need to rerun your node program with --debug or --inspect, (${err?.message})` });
    }
  }

  showBasicInfo = () => {
    const rows = [
      `<div>App version ${app.getVersion()}</div>`,
      `<div>App name ${app.name}</div>`,
      `<div>App path ${app.getAppPath()}</div>`,
      `<div>App exe path ${app.getPath('exe')}</div>`,
      `<div>App user data path ${app.getPath('userData')}</div>`,
      `<div>App user cache path ${app.getPath('cache')}</div>`,
      `<div>App user desktop path ${app.getPath('desktop')}</div>`,
      `<div>App user documents path ${app.getPath('documents')}</div>`,
      `<div>App user downloads path ${app.getPath('downloads')}</div>`,
      `<div>App user music path ${app.getPath('music')}</div>`,
      `<div>App user pictures path ${app.getPath('pictures')}</div>`,
      `<div>App user videos path ${app.getPath('videos')}</div>`,
      `<div>App user temp path ${app.getPath('temp')}</div>`,
      `<div>App user home path ${app.getPath('home')}</div>`,
    ];
    this.createWindowWithContent(rows.join('\n'));
  }

  createWindow = async (indexPath) => {
    const resultWindow = this.createBareWindow();
    resultWindow.primaryPath = indexPath;
    await loadFileOrUrl(resultWindow, indexPath);
    return resultWindow;
  }

  createWindowWithContent = async (content) => {
    const resultWindow = this.createBareWindow();
    loadUrlWhenAvailable(resultWindow, `data:text/html;charset=utf-8,${content}`);
    return resultWindow;
  }

  createBareWindow = () => {
    let resultWindow = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: { nodeIntegration: true, enableRemoteModule: true, worldSafeExecuteJavaScript: true, contextIsolation: false, webSecurity: false },
      show: false, // wait until page is loaded
    });

    resultWindow.once('ready-to-show', () => {
      resultWindow.show();
    });

    resultWindow.on('render-process-gone', (event, details) => {
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

    resultWindow.uuid = uuid();

    resultWindow.on('closed', () => {
      resultWindow = null;
    });
    return resultWindow;
  }

  createMainWindow = async (indexPath = process.env.HTML_SERVER_URL) => {
    if (this.mainwindow) {
      return this.mainwindow;
    }

    const htmlPath = path.join(getDistPath(), 'renderer', 'index.html');
    this.mainwindow = await this.createWindow(indexPath || htmlPath);
    this.initializeDeepLinking();
    this.menu = createMainMenu(this);
    this.mainwindow.webContents.on('ipc-message', this.onIpcMessageFromRenderer);

    if (this.isTrayApp) {
      this.setupAppAsTray();
    } else {
      this.setupAppAsNonTray();
    }

    return this.mainwindow;
  }

  setupAppAsNonTray = () => {
    if (isWindows()) {
      this.mainwindow.on('close', (event) => {
        process.exit(0);
      });
    }

    this.mainwindow.on('closed', () => {
      this.mainwindow = null;
      this.appReady = false;
    });
  }

  setupAppAsTray = async () => {
    if (isWindows()) {
      this.mainwindow.on('close', (event) => {
        event.preventDefault();
        this.mainwindow.destroy();
        this.mainwindow = null;
      });
    }

    this.mainwindow.on('closed', () => {
      this.mainwindow = null;
      this.appReady = null;
    });

    this.showDock();
  }

  showDock = () => {
    if (isMac()) app.dock.show();
  }

  hideDock = () => {
    if (isMac()) app.dock.hide();
  }

  createTray = () => {
    if (!this.tray) {
      this.tray = createTray({ showWindow: () => this.createOrShowMainWindow(), quit: this.quit, exampleAction: () => dialog.showMessageBox({ type: 'info', message: 'Example action' }) });
    }

    return this.tray;
  }

  createOrShowMainWindow = (deepLinkUrl) => {
    if (deepLinkUrl) {
      this.onDeepLinkUrl(deepLinkUrl);
    }

    if (!this.mainwindow) {
      return this.createMainWindow();
    } else {
      this.mainwindow.show();
      this.mainwindow.focus();
    }
  }

  confirmQuitSync = () => {
    let result = false;

    const buttons = [
      { title: 'Quit Immediately', action: () => (result = true) },
      { title: 'Leave Program Running', action: () => (result = false) },
    ];
    const message = 'This will stop all background actions!';

    this.showOptionDialog(message, buttons);

    return result;
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

  onIpcMessageFromRenderer = async (event, channel, ...args) => {
    console.log('got ipc message in main', channel);
    if (channel === 'app-ready') {
      this.appReady = true;
      this.sendDeepLinkUrl();
    } else if (channel === 'url') {
      console.log('got message', channel, args);
      const currentPage = this.mainwindow.webContents.getURL();
      try {
        await this.mainwindow.loadURL(args[0]);
      } catch (err) {
        console.log('failed to load url, attempting to load prior', currentPage);
        await this.mainwindow.loadURL(currentPage);
      }
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
    if (this.isTrayApp) {
      this.createTray();
    }
    this.startAutoUpdater();
  }
}
