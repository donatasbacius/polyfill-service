'use strict';

var ENV = process.env;

var fs = require('fs');
if (fs.existsSync('./.env.json')) {
	var environmentOverrides = require('./.env.json');
	ENV = require('lodash').extend(ENV, environmentOverrides);
}


module.exports = function(grunt) {

	grunt.initConfig({
		"clean": {
			repo: ['polyfills/__repo'],
			versions: ['polyfills/__versions'],
			dist: ['polyfills/__dist']
		},
		"simplemocha": {
			options: {
				globals: ['should'],
				timeout: 5000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec'
			},
			all: {
				src: ['test/node/**/*.js']
			}
		},
		"saucelabs": {
			compat: {
				options: {
					urls: {
						polyfilled: 'http://127.0.0.1:3000/test/director?mode=all',
						native: 'http://127.0.0.1:3000/test/director?mode=control'
					},
					browsers: browsers.full
				}
			},
			ci: {
				options: {
					cibuild: true,
					urls: {
						default: 'http://127.0.0.1:3000/test/director?mode=targeted'
					},
					browsers: browsers.ci
				}
			},
			quick: {
				options: {
					cibuild: true,
					urls: {
						default: 'http://127.0.0.1:3000/test/director?mode=targeted'
					},
					browsers: browsers.quick
				}
			}
		},
		"watch": {
			options: {
				spawn: false
			},
			js: {
				files: ['bin/*', 'docs/*.html', 'service/*.js', 'lib/*.js'],
				tasks: ['service:polyfillservice:restart']
			},
			polyfills: {
				files: ['polyfills/**/*.js', 'polyfills/**/config.json', '!polyfills/__dist/**'],
				tasks: ['service:polyfillservice:stop', 'buildsources', 'service:polyfillservice:start']
			}
		},
		"service": {
			polyfillservice: {
				shellCommand: __dirname + '/bin/polyfill-service',
				pidFile: __dirname+'/.service.pid',
				generatePID: true,
				options: {
					env: ENV,
					cwd: __dirname,
					failOnError: true
				}
			}
		},
		"updatelibrary": {
			options: {
				expand: true
			},
			tasks: {
				src: ['polyfills/**/update.task.js'],
			}
		}
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask("test", [
		"buildsources",
		"simplemocha",
		"service",
		"saucelabs:quick",
		"service:polyfillservice:stop"
	]);

	grunt.registerTask("compatgen", [
		"buildsources",
		"simplemocha",
		"service",
		"saucelabs:compat",
		"compattable",
		"service:polyfillservice:stop"
	]);

	grunt.registerTask("ci", [
		"buildsources",
		"simplemocha",
		"service",
		"saucelabs:ci",
		"service:polyfillservice:stop"
	]);

	grunt.registerTask("build", [
		"clean",
		"installcollections",
		"buildsources",
		"clean:repo",
		"clean:versions"
	]);

	grunt.registerTask("devbuild", [
		"clean",
		"buildsources",
		"clean:repo",
		"clean:versions"
	]);

	grunt.registerTask('dev', [
		"service",
		"watch"
	]);
};

var browsers = {
	quick: [
		['chrome', '46', 'Windows 7'],
		['firefox', '41', 'Linux'],
		['internet explorer', '7', 'Windows XP'],
		['internet explorer', '11', 'Windows 10'],
		['microsoftedge', '20.10240', 'Windows 10'],
	],
	ci: [
		['android', '4.4', 'linux', 'Android Emulator'],
		['chrome', '46', 'Windows 7'],
		['chrome', '35', 'OSX 10.11'],
		['firefox', '41', 'Linux'],
		['firefox', '30', 'OSX 10.11'],
		['internet explorer', '6', 'Windows XP'],
		['internet explorer', '7', 'Windows XP'],
		['internet explorer', '8', 'Windows XP'],
		['internet explorer', '9', 'Windows 7'],
		['internet explorer', '10', 'Windows 7'],
		['internet explorer', '11', 'Windows 10'],
		['microsoftedge', '20.10240', 'Windows 10'],
		['safari', '9.0', 'OSX 10.11'],
		['safari', '8.0', 'OSX 10.10'],
		['safari', '5.1', 'Windows 7'],
	],
	full: [
		['chrome', '46', 'Windows 7'],
		['chrome', '42', 'Windows 7'],
		['chrome', '35', 'OSX 10.11'],
		['chrome', '30', 'Windows 7'],
		['firefox', '41', 'Linux'],
		['firefox', '33', 'Linux'],
		['firefox', '30', 'OSX 10.11'],
		['firefox', '20', 'Linux'],
		['internet explorer', '6', 'Windows XP'],
		['internet explorer', '7', 'Windows XP'],
		['internet explorer', '8', 'Windows XP'],
		['internet explorer', '9', 'Windows 7'],
		['internet explorer', '10', 'Windows 7'],
		['internet explorer', '11', 'Windows 10'],
		['microsoftedge', '20.10240', 'Windows 10'],
		['safari', '9.0', 'OSX 10.11'],
		['safari', '8.0', 'OSX 10.10'],
		['safari', '5.1', 'Windows 7'],
		['android', '4.4', 'linux', 'Android Emulator'],
		['android', '4.3', 'linux', 'Android Emulator'],
		['android', '4.2', 'linux', 'Android Emulator'],
		['android', '4.1', 'linux', 'Android Emulator'],
		['iphone', '9.1', 'OSX 10.10', 'iPhone 6']
	]
};
