import { app } from 'electron';

export function relaunchMain() {
  console.log('relaunching');
  app.relaunch();
  app.exit(0);
}
