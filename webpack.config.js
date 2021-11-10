var publidDir = __dirname + '/public'
module.exports = {
  mode: "development",
  entry: [
    './src/index.js'
  ],
  output: {
    path: publidDir,
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
              presets: [['@babel/preset-env', { modules: false }]]
          }
        }
      ]
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
		static: {
			directory: publidDir
		}
  }
}