import path from 'path';
import fs from 'fs-extra';
import copyNodeModules from 'copy-node-modules';

function copyNodeModulesAsync(source, destination, options) {
  return new Promise((resolve, reject) => {
    copyNodeModules(source, destination, options, (err, results) => {
      if (err) reject(err);
      else (resolve(results));
    });
  })
}

const root = path.resolve(path.join(__dirname, '..', '..'));
const distPath = path.join(root, 'dist');
const resourcesPath = path.join(distPath, 'resources');
const resultPath = path.join(distPath, 'index.html');
const nodeModulePath = path.join(distPath, 'node_modules');

function makeBaseDirectories() {
  const basesToCheck = [path.dirname(resultPath), resourcesPath, nodeModulePath];

  for (let dex = 0; dex < basesToCheck.length; dex += 1) {
    const folder = basesToCheck[dex];
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }
}

function copyResources() {
  fs.copySync(path.join(root, 'electron', 'resources'), resourcesPath);
  fs.copySync(path.join(root, 'build', 'resources'), resourcesPath);
}

makeBaseDirectories();
copyResources();
copyNodeModulesAsync(root, distPath, { devDependencies: false });
