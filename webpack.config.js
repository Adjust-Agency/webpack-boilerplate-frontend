const isProduction = process.env.NODE_ENV === 'production';

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

const autoprefixer = require('autoprefixer');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const CleanPlugin = require('clean-webpack-plugin');

const PACKAGE = require('./package.json');

const options = {
	
	base: PACKAGE.hasOwnProperty('devConfig') && PACKAGE.devConfig.hasOwnProperty('base') ? PACKAGE.devConfig.base : './' ,
	src : PACKAGE.hasOwnProperty('devConfig') && PACKAGE.devConfig.hasOwnProperty('src') ? PACKAGE.devConfig.src : 'src',
	dist : PACKAGE.hasOwnProperty('devConfig') && PACKAGE.devConfig.hasOwnProperty('dist') ? PACKAGE.devConfig.dist : 'dist',
	
	mode : isProduction ? 'production' : 'development',
	sourcemaps : !isProduction,
	minify : isProduction	
};

module.exports = {
	
	mode: options.mode,
	
	entry: {
		
		main: [
			
			options.base + options.src + '/js/main.js',
			options.base + options.src + '/sass/main.scss'
		],
		
		vendor: ['jquery']
	},
	
	output: {
		path: path.resolve(__dirname, options.base + options.dist),
		filename: 'js/[name].js'
	},
	
	module: {
		
		rules: [
			
			{
				
				test: /\.js$/, 
				exclude: /node_modules/, 
				use:[ 
						{
							loader: 'babel-loader',
							options: {
								presets: ['env'],
								plugins: ["babel-plugin-transform-class-properties"]
							}
						},
						{
							loader: 'eslint-loader',
							options: {
							    env: {
							    	browser: true,
									es6: true,
									jquery: true
								},
							    parser: "babel-eslint",
							    extends: "standard",
							    rules: {
							    	'no-tabs': 0,
									'eol-last': 0,
									indent: ["warn", "tab"]
								}
							}
						}
					]
			},
			
			{
				
				test: /\.s[ac]ss$/, 
				use: ExtractTextPlugin.extract({
					use: [
							{ loader: 'css-loader', options: { minimize: options.minify, sourceMap: options.sourcemaps }}, 
							{ loader: 'postcss-loader', options: 
								{
									sourceMap: options.sourcemaps,
									plugins: [
										autoprefixer({ browsers: ['last 2 versions', 'ie >= 9']})
									]
								}
							},
							{ loader: 'sass-loader', options: { sourceMap: options.sourcemaps }}
						],
					fallback: 'style-loader'
				})
			},
			
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
						{
							loader: 'file-loader',
							options: {
								name: 'images/[name]-[hash].[ext]',
								publicPath: '..'
							}	
						},
						'img-loader'
					]
			},
			
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'fonts/[name]-[hash].[ext]',
						publicPath: '..'
					}	
				}
			}			
		]
	},
	
	plugins: [
		new ExtractTextPlugin('css/[name].css'),
		new PurifyCSSPlugin({
			paths:
				glob.sync(path.join(__dirname, options.base + '/**/*.php')).concat(
				glob.sync(path.join(__dirname, options.base + '/**/*.html'), { ignore: ["**/node_modules/**", "./node_modules/**"] }))			
		}),
		function() {
			this.plugin('done', stats => {
				
				let datas = {};
				for(let chunk of stats.toJson().chunks) {
					for(let name of chunk.names){
						datas[name] = chunk.hash;	
					}
				}
				
				fs.writeFileSync(
					path.join(__dirname, options.base, options.dist, 'manifest.json'),
					JSON.stringify(datas)	
				)
			});		
		}		
	]		
};

if (!fs.existsSync(options.base + options.dist)){
	fs.mkdirSync(options.base + options.dist);
}

if(!isProduction) {
		
		module.exports.plugins.unshift(
			new BrowserSyncPlugin(
	    	{
	        
	        	host: 'localhost',
				port: 3000,
				proxy: 'http://localhost:4000/',
				files: ["**/*.html", "**/*.php", options.base + options.dist + "/**/*.css", options.base + options.dist + "/**/*.js"],
				open: false,
				ghostMode: false,
				notify: false
				
	    	},{ reload: false })
	    );
	    
	    module.exports.plugins.push(
			new webpack.SourceMapDevToolPlugin({
				filename: '[file].map',
				exclude: ['js/vendor.js']
			})
		);
		
} else {
	
		module.exports.plugins.push(
			new CleanPlugin([options.base + options.dist], {
				root: __dirname,
				verbose: true,
				dry: false
			})
		);
	
}