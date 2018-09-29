const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HashOutput = require('webpack-plugin-hash-output');

const PATH = {
  INDEX: {
    JS: './src/components/index.jsx',
    CSS: './src/styles/index.scss',
    HTML: './src/index.html',
  },
  DIST: path.join(__dirname, 'public'),
};

const config = {
  entry: {
    bundle: [PATH.INDEX.JS, PATH.INDEX.CSS, PATH.INDEX.HTML],
  },
  output: {
    path: PATH.DIST,
    filename: '[name].[hash].js',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /react|react-dom|bootstrap|jquery|popper.js|tether/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['remove-flow-types-loader'],
        enforce: 'pre',
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.(js|jsx)$/,
        use: ['eslint-loader'],
        enforce: 'pre',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(jpe?g|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 40000 },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: PATH.INDEX.HTML,
    }),
    new ManifestPlugin({
      fileName: 'manifest.json',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    config.output.filename = '[name].[chunkhash].js';
    config.plugins.push(new ExtractTextPlugin('bundle.[chunkhash].css'));
    config.plugins.push(
      new HashOutput({
        validateOutput: true,
        validateOutputRegex: /^public\/.*\.{js|css}$/,
      }),
    );
  } else {
    // 'development'
    config.output.filename = '[name].[hash].js';
    config.plugins.push(new ExtractTextPlugin('bundle.[hash].css'));
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.devtool = 'source-map';
    config.devServer = {
      hot: true,
      contentBase: PATH.DIST,
      port: 8080,
      inline: true,
      historyApiFallback: true,
      stats: {
        version: false,
        hash: false,
        chunkModules: false,
      },
    };
  }

  return config;
};
