/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const {
  override,
  addWebpackModuleRule,
  addWebpackPlugin,
  addWebpackAlias,
} = require('customize-cra');
const ArcoWebpackPlugin = require('@arco-plugins/webpack-react');
const addLessLoader = require('customize-cra-less-loader');
const setting = require('./src/settings.json');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
// get git info from command line
let commitHash = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString()
  .trim();

if (process.env.DEV_MODE) {
  process.env.NODE_ENV = 'development';
}

module.exports = {
  webpack: override(
    addLessLoader({
      lessLoaderOptions: {
        lessOptions: {},
      },
    }),
    addWebpackModuleRule({
      test: /\.svg$/,
      loader: '@svgr/webpack',
    }),
    addWebpackPlugin(
      new CopyPlugin({
        patterns: [
          {from: "src/locale/*.json", to: "locale/[name].json"},
        ],
        options: {
          concurrency: 100,
        },
      })
    ),
    addWebpackPlugin(
      new ArcoWebpackPlugin({
        theme: '@arco-themes/react-arco-pro',
        modifyVars: {
          'arcoblue-6': setting.themeColor,
        },
      })
    ),
    addWebpackAlias({
      '@': path.resolve(__dirname, 'src'),
    }),
    addWebpackPlugin(
      new webpack.DefinePlugin({
        '__GIT_COMMIT': JSON.stringify(commitHash)
      })
    ),
    (config) => {
      if (process.env.DEV_MODE) {
        process.env.NODE_ENV = 'development';
        config.mode = 'development';
        config.optimization.minimize = false;
      }
      return config;
    },
  ),
};
