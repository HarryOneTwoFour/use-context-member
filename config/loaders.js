const path = require('path');

module.exports = {
  rules: [
    {
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      exclude: [
        path.resolve(__dirname, "../node_modules"),
      ],
      options: {
        configFile: path.resolve('babel.config.js')
      },
    },
  ]
};
