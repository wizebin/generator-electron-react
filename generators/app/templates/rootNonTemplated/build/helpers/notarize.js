const { notarize } = require('electron-notarize');
const electronConfig = require('../../electron-builder.json');
const packageJson = require('../../package.json');
const { get } = require('lodash');
const path = require('path');

exports.default = function (electronBuilderParams) {
  const { outDir, appOutDir, packager, electronPlatformName, arch, targets } = electronBuilderParams;
  const options = {
    appPath: path.join(appOutDir, `${packager.appInfo.productFilename}.app`),
    appBundleId: get(electronConfig, 'appId') || get(packageJson, ['build', 'appId']),
    ascProvider: process.env.API_TEAM,
  };

  if (process.env.API_KEY_ID && process.env.API_KEY_ISSUER_ID) {
    options.appleApiKey = process.env.API_KEY_ID;
    options.appleApiIssuer = process.env.API_KEY_ISSUER_ID;
  } else if (process.env.APPLE_ID && APPLE_ID_PASSWORD) {
    options.appleId = process.env.APPLE_ID;
    options.appleIdPassword = process.env.APPLE_ID_PASSWORD;
  } else {
    console.log('skipping notarize, missing (APPLE_ID + APPLE_ID_PASSWORD) or (API_KEY_ID + API_KEY_ISSUER_ID) environment variables');
    return false;
  }

  console.log('notarizing', options.appBundleId, options.appPath);

  return notarize(options);
}
