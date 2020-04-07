const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');
const packagejson = require('../../package.json');
const { dependencies: externals } = packagejson;

module.exports = {
  entry: './electron/main.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: path.join(__dirname, '../..', 'dist'),
    publicPath: './',
    filename: 'electronMain.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new dotenv(path.join(__dirname, '../../.env')),
  ],
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [...Object.keys(externals || {})],
  target: 'electron-main',
};
