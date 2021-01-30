const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const basePlugins = [];
const runtime = process.env.AS_WEB ? 'web' : 'electron';
const importableFileExtensions = /\.(woff|woff2|eot|ttf|svg|png|jpg|jpeg|mp3|mp4)$/;
const calculatedExternals = nodeExternals({
  modulesDir: path.join(__dirname, '..', '..', 'node_modules'),
  allowlist: [/.css/i, /monaco/i, importableFileExtensions], // HAVE A NODE MODULE THAT ISN'T WORKING? TRY ADDING IT TO THIS ALLOW LIST BY NAME /NAME_OF_MODULE/i
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
        use: [{
          loader: 'babel-loader',
          options: { // using options here instead of using the root babelrc so we can have a different configuration
            presets: [[
              "@babel/preset-env", { targets: { chrome: "58" } }],
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-optional-chaining",
              "react-hot-loader/babel"
            ]
          }
        }]
      }, {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
            }
          }
        ],
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
        exclude: /\.module\.css$/
      }, {
        test: importableFileExtensions,
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
    port: 10113,
  },
  target: process.env.AS_WEB ? undefined : 'electron-renderer',
};
