/* eslint-env node, commonjs */
// development config
import merge from 'webpack-merge';
import webpack from 'webpack';
import commonConfig, { assetsDir } from './common.mjs';

export default merge(commonConfig(true), {
  mode: 'development',
  entry: [
    'react-hot-loader/patch', // activate HMR for React
    'webpack-dev-server/client?http://localhost:8080', // bundle the client for webpack-dev-server and connect to the provided endpoint
    'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
    './index.tsx', // the entry point of our app
  ],
  devServer: {
    hot: true, // enable HMR on the server
    static: {
      directory: assetsDir,
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
    },
  },
  //devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
    new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
  ],
});
