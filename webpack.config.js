const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const publidDir = path.join(__dirname, '/public')

module.exports = [
  {
    mode: "development",
    devtool: "hidden-source-map",
    entry: [
      './js/index.js',
    ],
    output: {
      path: publidDir,
      publicPath: '/',
      clean: {
        keep: '/index.html/'
      }
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", "@babel/preset-react"],
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devServer: {
      historyApiFallback: true,
      static: {
        directory: publidDir
      }
    },
  },
  {
    mode: "development",
    entry: {
      style: "./css/style.css",
    },
    output: {
      path: publidDir,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
            "sass-loader",
          ],
        },
      ],
    },
    plugins: [new MiniCssExtractPlugin({ filename: "bundle.css" })],
  },
]