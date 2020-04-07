const { notarize } = require('electron-notarize');
const electronConfig = require('../../electron-builder.json');
const packageJson = require('../../package.json');
const { get } = require('lodash');
const path = require('path');

exports.default = function (electronBuilderParams) {
  const { outDir, appOutDir, packager, electronPlatformName, arch, targets } = electronBuilderParams;
  const options = {
    appleApiKey: process.env.API_KEY_ID,
    appleApiIssuer: process.env.API_KEY_ISSUER_ID,
    appPath: path.join(appOutDir, `${packager.appInfo.productFilename}.app`),
    appBundleId: get(electronConfig, 'appId') || get(packageJson, ['build', 'appId']),
    ascProvider: process.env.API_TEAM,
  };

  if (!options.appleApiKey || !options.appleApiIssuer) {
    console.log('skipping notarize, missing API_KEY_ID or API_KEY_ISSUER_ID environment variable');
    return false;
  } else {
    console.log('notarizing', options.appBundleId, options.appPath);
  }

  return notarize(options);
}
