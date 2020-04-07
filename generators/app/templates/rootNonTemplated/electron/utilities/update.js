import { autoUpdater } from 'electron-updater';

export function checkForAppUpdate() {
  autoUpdater.checkForUpdatesAndNotify();
}
