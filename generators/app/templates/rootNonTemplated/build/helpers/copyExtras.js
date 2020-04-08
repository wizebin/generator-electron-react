import path from 'path';
import fs from 'fs-extra';
import packagejson from '../../package.json';

const root = path.resolve(path.join(__dirname, '..', '..'));
const resourcesPath = path.join(root, 'dist', 'resources');
const resultPath = path.join(root, 'dist', 'index.html');
const nodeModulePath = path.join(root, 'dist', 'node_modules');

function makeBaseDirectories() {
  const basesToCheck = [resultPath, resourcesPath, nodeModulePath];

  for (let dex = 0; dex < basesToCheck.length; dex += 1) {
    const folder = path.dirname(basesToCheck[dex]);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }
}

function copyResources() {
  fs.copySync(path.join(root, 'electron', 'resources'), resourcesPath);
}

function copyNodeModules() {
  Object.keys(packagejson.dependencies).map(item => {
    const itemPath = path.join(nodeModulePath, item) + '/';

    if (!fs.existsSync(itemPath)) {
      fs.copySync(path.join(root, 'node_modules', item), itemPath, { dereference: true });
    }
  });
}

makeBaseDirectories();
copyResources();
copyNodeModules();
