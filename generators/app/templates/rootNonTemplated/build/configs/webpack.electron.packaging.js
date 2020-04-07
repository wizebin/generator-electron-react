const baseconfig = require('./webpack.electron');
const webpack = require('webpack');

baseconfig.plugins = (baseconfig.plugins || []).concat([
  new webpack.DefinePlugin({
    'process.env.WEBPACK_PREPROCESSOR_IS_PACKAGING': true,
  }),
]);

module.exports = baseconfig;
