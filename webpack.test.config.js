var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'app');
var TEST_PATH = path.resolve(ROOT_PATH, 'tests');
var TEM_PATH = path.resolve(ROOT_PATH, 'templates');

module.exports = {
  entry: 'mocha!./tests/test.js',
  output: {
    filename: 'test.build.js',
    path: TEST_PATH
  },
  module: {
    loaders: [
        {
            test: /\.jsx?$/,
            loader: 'babel',
            include: APP_PATH,
            query: {
                presets: ['es2015']
            }
        },
        {
            test: /\.scss$/,
            loaders: ['style', 'css?sourceMap', 'sass?sourceMap'],
            include: APP_PATH
        },
        {
            test: /\.(png|jpg|jpeg|gif|ico)$/,
            loader: 'file-loader?name=/imgs/[name].[ext]'
        },
        {
            test: /\.(woff2?|ttf|eot|svg)$/,
            loader: 'url?limit=10000'},
        {
            test: /bootstrap\/dist\/js\/umd\//,
            loader: 'imports?jQuery=jquery'
        },
        { test: /\.json$/, loader: "file-loader?name=/data/[name].[ext]" }
    ]
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Test case',
      template: path.resolve(TEM_PATH, 'test.html')
    }),
      new webpack.ProvidePlugin({
          jQuery: 'jquery',
          $: 'jquery',
          jquery: 'jquery'
      })
  ]
}
