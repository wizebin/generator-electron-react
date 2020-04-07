import { ipcRenderer } from 'electron';

export function listenForIpcMessages(type, listener) {
  return ipcRenderer.on(type, listener);
}

export function stopListeningForIpcMessages(type, listener) {
  return ipcRenderer.off(type, listener);
}

export function sendIpcMessage(type, data) {
  return ipcRenderer.send(type, data);
}
