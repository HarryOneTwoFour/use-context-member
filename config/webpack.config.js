const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: '/test/index.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'build.js',
  },
  module: require("./loaders"),
  devServer: {
    open: false,
    publicPath: '/',
    historyApiFallback: true,
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 80,
    hot: true,
  },
  resolve: {
    symlinks: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/template.html'),
      chunks: [],
    }),
  ]
}
