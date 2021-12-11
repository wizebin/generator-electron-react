const path = require('path');
const webpack = require('webpack');
const packagejson = require('../../package.json');
const { dependencies: externals } = packagejson;
const copyNodeModules = require('@wizebin/copy-node-modules');

const root = path.resolve(path.join(__dirname, '..', '..'));
const baseOutputFolder = path.join(root, 'dist');

function copyNodeModulesAsync(source, destination, options) {
  return new Promise((resolve, reject) => {
    copyNodeModules(source, destination, options, (err, results) => {
      if (err) reject(err);
      else (resolve(results));
    });
  })
}

module.exports = {
  entry: './electron/main.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [[
              "@babel/preset-env", { targets: { electron: "12" } }],
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
  plugins: [
    { apply: (compiler) => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', async (compilation) => {
        await copyNodeModulesAsync(root, baseOutputFolder, { devDependencies: false, verbose: true, overwiteIfVersionChange: true });
      });
    } }
  ],
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: baseOutputFolder,
    publicPath: './',
    filename: 'electronMain.js',
    libraryTarget: 'commonjs2'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externalsPresets: { electronMain: true, node: true },
  externals: [...Object.keys(externals || {})],
  target: 'electron-main',
};
