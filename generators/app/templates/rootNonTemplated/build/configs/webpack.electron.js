const path = require('path');
const webpack = require('webpack');
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
      }, {
        test: /\.(sql|txt|csv|tsv)$/,
        type: 'asset/inline',
        generator: {
          dataUrl: content => {
            return content.toString();
          }
        }
      }, {
        test: /\.(bin|raw|png|ico|svg|jpg|jpeg|gif)$/,
        type: 'asset/inline',
        generator: {
          dataUrl: content => content
        }
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
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [...Object.keys(externals || {})],
  target: 'electron-main',
};
