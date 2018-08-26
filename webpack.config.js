var path = require('path');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var WriteFilePlugin = require('write-file-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  entry: './wwwroot/assets/scripts/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './wwwroot/dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.ProvidePlugin({
      noUiSlider: 'nouislider'
    }),
    new WriteFilePlugin
  ]
};