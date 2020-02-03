/* global process, require, module, __dirname */

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/app.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /codemirror/],
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env']],
        },
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.handlebars$/, loader: 'handlebars-loader' },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.html'],
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
  },
};
