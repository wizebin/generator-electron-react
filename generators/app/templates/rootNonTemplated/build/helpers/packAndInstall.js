import child from 'child_process';
import path from 'path';
import fs from 'fs';

const root = path.join(__dirname, '..', '..');
const tmp = path.join(root, 'tmp');
fs.mkdirSync(tmp, { recursive: true });

console.log('args', process.argv);

const sourcePath = process.argv[2];
const packageAtPath = path.join(sourcePath, 'package.json');
const parsed = JSON.parse(fs.readFileSync(packageAtPath).toString());

console.log('packing', parsed.name);

const result = child.execSync(`npm pack ${sourcePath}`, { cwd: tmp });

console.log('pack result', result.toString());

const filename = path.join(tmp, result.toString());

child.execSync(`npm install ${filename}`, { cwd: root });
