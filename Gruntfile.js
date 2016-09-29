module.exports = function(grunt) {

	// load all grunt tasks in package.json matching the `grunt-*` pattern
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		pkg: grunt.file.readJSON( 'package.json' ),

		csscomb: {
			dist: {
				files: [{
					expand: false,
					cwd: 'assets/css/styles.css',
					src: [
						 'assets/css/styles.css'
					],
				}]
			}
		},

		sass: {
			dist: {
				options: {
					style: 'expanded',
					lineNumbers: false,
				},
				files: {
				  'assets/css/styles.css': 'assets/sass/styles.scss',
				}
			}
		},

		cmq: {
			options: {
				log: false
			},
			dist: {
				files: {
					'assets/css/styles.css': 'assets/css/styles.css',
				}
			}
		},

		cssmin: {
			options: {
				// banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				// 	' * <%= pkg.homepage %>\n' +
				// 	' * Copyright (c) <%= grunt.template.today("yyyy") %>;' +
				// 	' * Licensed GPLv2+' +
				// 	' */\n'
			},
			minify: {
				expand: true,
				src: [
					'assets/css/styles.css',
				],
				ext: '.min.css'
			}
		},

		jshint: {
			all: [
				'assets/js/scripts.js',
			],
			options: {
				curly   : true,
				eqeqeq  : true,
				immed   : true,
				latedef : true,
				newcap  : true,
				noarg   : true,
				sub     : true,
				unused  : true,
				undef   : true,
				boss    : true,
				eqnull  : true,
				globals : {
					exports : true,
					module  : false
				},
				predef  :['XMLHttpRequest', 'ActiveXObject', 'FormData', 'jQuery', 'alert', 'cookie', 'console', 'google', 'document', 'navigator', 'location', 'window', 'Event']
			}
		},

		uglify: {
			all: {
				files: {
					'assets/js/scripts.min.js': ['assets/js/scripts.js'],
				},
				options: {
					mangle: true
				}
			}
		},

		watch: {

			css: {
				files: [
					'assets/sass/**/*.{scss,sass}'
				],
				tasks: ['styles'],
				options: {
					spawn: false,
				},
			},

			scripts: {
				files: ['assets/js/*.js'],
				tasks: ['js'],
				options: {
					debounceDelay: 500
				}
			},

			other: {
				files: [ '*.php', '**/*.php', '!node_modules/**', '!tests/**', '!assets/banner/**' ],
			}

		},

		// make a zipfile
		compress: {
			main: {
				options: {
					mode: 'zip',
					archive: 'nbalive.zip'
				},
				files: [ {
						expand: true,
						// cwd: '/',
						src: [
							'**',
							'!node_modules/**',
							'!sass/**',
							'!**.zip',
							'!Gruntfile.js',
							'!package.json',
							'!phpunit.xml',
							'!tests/**',
							'!assets/banner/**',
							'!**/*.gitignore',
							'!**/*.gitattributes',
							'!**/*.bat',
							'!**/*.map',
							'!**/*.DS_Store',
							'!**/*.AppleDouble',
							'!**/*.LSOverride',
							'!**/*.MD',
							'!**/logs',
							'!**/*.DS_Store',
							'!**/*.AppleDouble',
							'!**/*.LSOverride',
							'!._*',
							'!**/*.ds_store',
						],
						dest: '/'
				} ]
			}
		}

	});

	grunt.registerTask('styles', ['sass', 'csscomb', 'cmq', 'cssmin']);
	grunt.registerTask('js', ['jshint', 'uglify']);
	grunt.registerTask('tests', ['jshint']);
	grunt.registerTask('default', ['styles', 'js', 'tests']);
};
