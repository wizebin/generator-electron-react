const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const packagejson = require('../../package.json');
const nodeExternals = require('webpack-node-externals');

const basePlugins = [];
const runtime = process.env.AS_WEB ? 'web' : 'electron';
const calculatedExternals = nodeExternals({
  allowlist: [/(?<!(js|jsx))$/i], // anything that is not javascript, using lookbehind
});

if (!process.env.AS_WEB) {
  basePlugins.push(new webpack.ExternalsPlugin('commonjs', [
    'desktop-capturer',
    'electron',
    'ipc',
    'ipc-renderer',
    'native-image',
    'remote',
    'web-frame',
    'clipboard',
    'crash-reporter',
    'screen',
    'shell',
  ].concat(calculatedExternals)));
}

const baseEntry = path.resolve(path.join(__dirname, '..', '..', 'src', 'index.js'));
const baseOutputFolder = path.resolve(path.join(__dirname, '..', '..', 'dist'));
const baseMainFolder = path.resolve(path.join(__dirname, '..', '..', 'electron'));
const rendererSubfolder = path.join('renderer');
const rendererOutputFolder = path.join(baseOutputFolder, rendererSubfolder);
const loaderPattern = path.posix.join('assets', '[name].[ext]');

module.exports = {
  entry: baseEntry,
  // context: srcPath,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.(woff|woff2|eot|ttf|svg|png|jpg|jpeg|mp3|mp4)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: loaderPattern,
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production' ? true : false
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    path: rendererOutputFolder,
    publicPath: process.env.PACKAGING ? './' : undefined,
    filename: 'bundle.js'
  },
  plugins: basePlugins.concat([
    new dotenv(path.join(__dirname, '../../.env')),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': process.env.NODE_ENV,
      'RUNTIME': runtime,
    }),
    new HtmlWebPackPlugin({
      template: path.join(baseMainFolder, 'index.html'),
      filename: "./index.html"
    }),
  ]),
  devServer: {
    contentBase: rendererOutputFolder,
    hot: true,
    port: 9998,
  },
  target: process.env.AS_WEB ? undefined : 'electron-renderer',
};
