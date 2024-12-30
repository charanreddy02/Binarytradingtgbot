const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    bot: path.join(__dirname, 'functions/bot/bot.js')
  },
  output: {
    path: path.join(__dirname, 'functions-build'),
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: { node: '18' } }]]
          }
        }
      }
    ]
  }
};
