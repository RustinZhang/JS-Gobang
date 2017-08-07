const path = require('path');
const webpack = require('webpack');


const config = {
  entry: {
    AI_worker:'./staging/scripts/AI_worker.js',
    gobang: './staging/scripts/make_move_GUI.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/scripts'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test   : /\.js$/,
        exclude: /node_modules/,
        loader : "babel-loader",
      },
      
    ]
  },
    plugins:[
        new webpack.optimize.UglifyJsPlugin()
    ]

};

module.exports = config;
