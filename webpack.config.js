const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    mode: 'development',
    // devtool: 'source-map',
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/index.js'
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ]
            },
            {
                test: /\.(css|sass|scss)/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpeg)/,
                type: 'asset/resource',
                generator: {
                    filename: 'ima/[name].[ext]'
                },
            },
            {
                test: /\.pug/,
                use: [
                    {
                        loader: 'html-loader'
                    },
                    {
                        loader: 'pug-html-loader'
                    },
                ]
            },
            {
                test: /\.json/,
                use: [
                    {
                        loader: 'json-loader',
                    }
                ]
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './style/main.css',
        }),
        new HtmlWebpackPlugin({
            template: './src/html/index.pug',
            // filename: 'index.pug'
        }),
        new CleanWebpackPlugin()
    ],
    externals: {
        jquery: 'jQuery',
        regl: 'createREGL',
        aos: 'AOS',
        modaal: 'modaal'
    }
}