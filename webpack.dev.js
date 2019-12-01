const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    publicPath: '/',
    host: '127.0.0.1',
    port: 8080,
    open: true
  }
});