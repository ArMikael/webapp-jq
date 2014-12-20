module.exports = function (grunt) {
	'use strict';

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		dirs: {
			src: 'src',
			dest: 'public'
		},

		jshint: {
			options: {
				jshintrc: true
			},
			target: {
				src: '<%= dirs.src %>/js/main.js'
			}
		},

		uglify: {
			options: {
				banner: '/*! I am Ugly! */\n',
				compress: true,
				mangle: true,
				sourceMap: true
			},
			target: {
				src: '<%= dirs.src %>/js/main.js',
				dest: '<%= dirs.dest %>/js/main.min.js'
			}
		},

		concat: {
			options: {
				separator: ';',
				sourceMap: true
			},
			target: {
				src: '<%= dirs.src %>/js/*.js',
				dest: '<%= dirs.dest %>/js/main.js'
			}
		},

		sass: {
			options: {
				outputStyle: 'compressed',
				sourceMap: true
			},
			target: {
				src: '<%= dirs.src %>/css/main.scss',
				dest: '<%= dirs.dest %>/css/main.min.css'
			}
		},

		clean: {
			all: '<%= dirs.dest %>',
			css: '<%= dirs.dest %>/css',
			js: '<%= dirs.dest %>/js'
		},

		watch: {
			options: {
				livereload: true
			},

			configs: {
				options: {
					reload: true
				},
				files: ['Gruntfile.js', 'package.json']
			},

			javascript: {
				files: ['<%= dirs.src %>/js/*.js'],
				tasks: ['build-js']
			},

			sass: {
				files: ['<%= dirs.src %>/css/**/*.scss'],
				tasks: ['build-css']
			},

			html: {
				files: ['*.html']
			}
		},

		connect: {
			server: {
				options: {
					port: 9003,
					hostname: 'localhost',
					base: '.',
					livereload: true,
					open: true
				}
			}
		}
	});


	grunt.registerTask('build-js', ['clean:js', 'jshint', 'concat' , 'uglify']);
	grunt.registerTask('build-css', ['clean:css', 'sass']);
	grunt.registerTask('build', ['clean:all', 'build-js', 'build-css']);

	grunt.registerTask('serve', ['connect', 'watch']);
	grunt.registerTask('default', ['build']);

};

// Command line: grunt jshint
// Command line: grunt uglify
// Command line: grunt concat
