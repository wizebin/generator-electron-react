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
        use: [{
          loader: 'babel-loader',
          options: { // using options here instead of using the root babelrc so we can have a different configuration
            presets: [[
              "@babel/preset-env", { targets: { electron: "12" } }],
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-optional-chaining"
            ]
          }
        }]
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
