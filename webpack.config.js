const {
  resolve
} = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const precss = require('precss');
const cssnext = require('postcss-cssnext');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const url = require('url');

//const PUBLIC_PATH = 'https://dq7xb1ewqq8wi.cloudfront.net/';
const PUBLIC_PATH = 'https://static.tianxi100.com/'
const PROJECT_NAME = 'tokemama.io';
const OUTPUT_DIR = 'build/dist';

module.exports = (options = {}) => ({
  entry: {
    //'common-vendor': './src/common-vendor',
    //vendor: './src/vendor',
    index: './src/main.js',
    promo: './src/promo.js',
    'red-packet': './src/rp.js'
  },
  externals: {
    'axios': 'axios',
    'vue': 'Vue',
    'vuetify': 'Vuetify',
    'vue-router': 'VueRouter',
    'vue-i18n': 'VueI18n',
    'vue-clipboard2': 'VueClipboard',
    'vue-social-sharing': 'SocialSharing',
    'vue-chartjs': 'VueChartJs',
    'moment': 'moment',
    'v-qrcode': 'VQrcode'
  },
  output: {
    path: resolve(__dirname, OUTPUT_DIR),
    filename: options.dev ? '[name].js' : '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js',
    publicPath: options.dev ? '/_dev/' : PUBLIC_PATH
  },
  module: {
    rules: [{
        test: /\.(vue|js)$/,
        enforce: 'pre',
        use: [
          {
            /*options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
              
            },*/
            loader: 'eslint-loader',
          },
        ],
        include: resolve(__dirname, 'src'),
      },
      {
        test: /\.vue$/,
        use: ['vue-loader']
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: [resolve('src'), resolve('node_modules/vue-echarts'), resolve('node_modules/resize-detector')]
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            root: resolve(__dirname, 'src'),
            attrs: ['img:src', 'link:href']
          }
        }]
      },
      {
        test:  /\.scss$/,
        use:  ["style!css!sass"]
      },
      {
        test:  /\.less$/,
        use:  ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({fallback:'style-loader', use:['css-loader', 'postcss-loader']})
      },
      {
        test: /favicon\.png$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }]
      }
    ]
  },
  plugins: [
    // short-circuits all Vue.js warning code
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en\-ca/),
    /*
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common-vendor']
    }),
    */
    new ExtractTextPlugin('[name].[hash].css'),
    new PreloadWebpackPlugin({
      rel: 'preload',
      as: 'script',
      include: 'allChunks',
      fileBlacklist: [/\.(css|map)$/, /base?.+/]
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }), 
    new HtmlWebpackPlugin({
      template: 'src/promo.html',
      filename: 'promo.html',
      chunks: [ 'promo']
    }),
    new HtmlWebpackPlugin({
      template: 'src/rp.html',
      filename: 'rp.html',
      chunks: [ 'red-packet']
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      chunks: [ 'index']
    }),
    new webpack.LoaderOptionsPlugin({
       minimize: true,
       postcss: function() {
        return [autoprefixer, precss, cssnano, cssnext]
      },
    }),
    //new OfflinePlugin()
    /*
    // minify with dead-code elimination
    new webpack.optimize.UglifyJsPlugin({
     compress: {
       warnings: false
     }
    }),
    //optimize module ids by occurence count
    //new webpack.optimize.OccurenceOrderPlugin()*/
  ],
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '~': resolve(__dirname, 'src'),
      components: resolve(__dirname, './src/components')
    }
  },
  devServer: {
    disableHostCheck: true,
    host: '127.0.0.1',
    port: 8010,
    proxy: {
      '/api/': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    historyApiFallback: {
      index: url.parse(options.dev ? '/_dev/' : PUBLIC_PATH).pathname
    }
  },
  devtool: options.dev ? '#eval-source-map' : '#source-map'
})
