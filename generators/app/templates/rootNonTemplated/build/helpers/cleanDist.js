import path from 'path';
import fs from 'fs-extra';

const root = path.resolve(path.join(__dirname, '..', '..'));
fs.removeSync(path.join(root, 'dist'));
