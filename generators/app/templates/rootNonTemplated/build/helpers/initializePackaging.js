import path from 'path';
import fs from 'fs-extra';

function getEnvironmentPath(environmentName) {
  return path.join(__dirname, '..', 'environments', environmentName + '.env');
}

async function getEnvironment(environmentName) {
  const data = await fs.readFile(getEnvironmentPath(environmentName));
  const results = {};
  const rows = data.toString().split(/\r?\n/g).filter(row => !!row);
  rows.forEach(row => {
    const cols = row.split('=');
    results[cols[0]] = cols[1];
  });
  return results;
}

async function modifyElectronBuilderForEnvironment(environmentName) {
  const jsonPath = path.join(__dirname, '..', '..', 'electron-builder.json');
  const currentData = await fs.readFile(jsonPath);
  const environment = await getEnvironment(environmentName);
  const current = JSON.parse(currentData.toString());

  current.productName = environment.APP_NAME || current.productName;
  current.appId = environment.APP_ID || current.appId;

  current.publish = {
    ...current.publish,
    bucket: environment.PUBLISH_BUCKET || current.publish.bucket,
    path: environment.PUBLISH_PATH || current.publish.path,
    provider: environment.PUBLISH_PROVIDER || current.publish.provider,
    acl: environment.PUBLISH_ACL || current.publish.acl,
  };

  fs.writeFile(jsonPath, JSON.stringify(current, null, 2));
}

async function copyRelevantEnvironment(environmentName) {
  const environment = await getEnvironment(environmentName);

  environment.NODE_ENV = environmentName;
  environment.PACKAGED = true;

  const resultString = Object.keys(environment).map(key => `${key}=${environment[key]}`).join('\r\n');

  fs.promises.writeFile(path.join(__dirname, '..', '..', '.env'), resultString);
}

const passedEnvironment = process.argv[process.argv.length - 1];
if (['development', 'production'].indexOf(passedEnvironment) === -1) {
  console.error('You must pass a valid environment', process.argv);
  process.exit(1);
}

modifyElectronBuilderForEnvironment(passedEnvironment);
copyRelevantEnvironment(passedEnvironment);
