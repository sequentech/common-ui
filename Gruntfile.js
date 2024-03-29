/**
 * This file is part of common-ui.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * common-ui is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * common-ui  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with common-ui.  If not, see <http://www.gnu.org/licenses/>.
**/

/*jslint node: true */
'use strict';

var pkg = require('./package.json');
var SEQUENT_CONFIG_VERSION = 'master';

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function(fileTypePatterns) {
  fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
  var ignore = ['node_modules','dist','temp', 'env'];
  var fs = require('fs');
  return fs.readdirSync(process.cwd())
          .map(function(file){
            if (ignore.indexOf(file) !== -1 ||
                file.indexOf('.') === 0 ||
                !fs.lstatSync(file).isDirectory()) {
              return null;
            } else {
              return fileTypePatterns.map(function(pattern) {
                return file + '/**/' + pattern;
              });
            }
          })
          .filter(function(patterns){
            return patterns;
          })
          .concat(fileTypePatterns);
};

module.exports = function (grunt) {

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // custom grunt task to check SequentConfig.js
  grunt.registerTask('check_config', function() {
    var fs = require('fs');
    var done = this.async();
    grunt.log.ok('Checking SequentConfig.js...');
    var conf = fs.readFile('SequentConfig.js', function(err, data) {
        if (err) {
            grunt.log.error('No SequentConfig.js file found');
            done(false);
        } else {
            var match = data.toString().match(/SEQUENT_CONFIG_VERSION = [\'\"](.*)[\'\"\-];/);
            if (!match) {
                grunt.log.error('Invalid SequentConfig.js version');
            } else {
                var v = match[1];
                if (v === SEQUENT_CONFIG_VERSION) {
                    return done();
                } else {
                    grunt.log.error('Invalid SequentConfig.js version: ' + v);
                }
            }
            done(false);
        }
    });
  });

  // Project configuration.
  grunt.initConfig({
    connect: {
      main: {
        options: {
          port: 9001
        }
      }
    },
    watch: {
      main: {
        options: {
            livereload: true,
            livereloadOnError: false,
            spawn: false
        },
        files: [createFolderGlobs(['*.js','*.less','*.html']),'!_SpecRunner.html','!.grunt'],
        tasks: [] //all the tasks are run dynamically during the watch event handler
      }
    },
    jshint: {
      main: {
        options: {
            jshintrc: '.jshintrc'
        },
        src: createFolderGlobs('*.js')
      }
    },
    clean: {
      before:{
        src:['dist','temp']
      },
      after: {
        src:['temp']
      }
    },
    less: {
      production: {
        options: {
          strictImports: true
        },
        files: [{
          expand: true,
          src: ['themes/**/app.less'],
          dest: 'temp/',
          ext: '.css'
        }]
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')()
        ]
      },
      dist: {
        src: 'temp/themes/**/app.css'
      }
    },
    ngtemplates: {
      main: {
        options: {
            module: pkg.name,
            htmlmin:'<%= htmlmin.main.options %>'
        },
        src: [createFolderGlobs('*.html'),'!index.html','!_SpecRunner.html'],
        dest: 'temp/templates.js'
      }
    },
    dom_munger:{
      read: {
        options: {
          read:[
            {selector:'script[class="libnocompat"]',attribute:'src',writeto:'libnocompatjs'},
            {selector:'script[class="lib"]',attribute:'src',writeto:'libjs'},
            {selector:'script[class="app"]',attribute:'src',writeto:'appjs'},
            {selector:'link[rel="stylesheet"][data-concat!="false"]',attribute:'href',writeto:'appcss'}
          ]
        },
        src: 'index.html'
      },
      update: {
        options: {
          remove: ['script[data-remove!="false"]','link[data-remove!="false"]'],
          append: [
            {selector:'body',html:'<script src="/libnocompat-vmaster.js"></script>'},
            {selector:'body',html:'<!--All the source code of this program under copyright. Take a look at the license details at https://github.com/sequent/sequent-core-common/blob/master/README.md -->'},
            {selector:'body',html:'<script src="/appCommon-vmaster.js"></script>'},
            {selector:'body',html:'<script src="/SequentPlugins-vmaster.js"></script>'},
            {selector:'head',html:'<link rel="stylesheet" id="theme" href="/themes/default/app.min.css">'}
          ]
        },
        src:'index.html',
        dest: 'dist/index.html'
      }
    },
    cssmin: {
      main: {
        files: [{
            expand: true,
            cwd:'temp/themes',
            src: ['**/app.css'],
            dest: 'dist/themes/',
            ext: '.min.css',
            extDot: 'first'
        }]
      },
    },
    concat: {
      main: {
        files: {
          'temp/libnocompat.js': ['<%= dom_munger.data.libnocompatjs %>'],
          'temp/lib.js': ['<%= dom_munger.data.libjs %>'],
          'temp/app.js': ['<%= dom_munger.data.appjs %>','<%= ngtemplates.main.dest %>'],
          'dist/SequentConfig-vmaster.js': ['SequentConfig.js'],
          'dist/SequentThemes-vmaster.js': ['SequentThemes.js'],
          'dist/SequentPlugins-vmaster.js': ['plugins/**/*.js']
        }
      },
      postUglify: {
        files: {
          'dist/libCommon-vmaster.js': ['dist/libCommon-vmaster.js', 'node_modules/i18next/dist/umd/i18next.js']
        }
      },
    },
    "merge-json": {
      main: {
        files: {
            "dist/locales/en.json": ["locales/en.json", "plugins/**/locales/en.json"],
            "dist/locales/es.json": ["locales/es.json", "plugins/**/locales/es.json"],
            "dist/locales/fr.json": ["locales/fr.json", "plugins/**/locales/fr.json"],
            "dist/locales/it.json": ["locales/it.json", "plugins/**/locales/it.json"],
            "dist/locales/gl.json": ["locales/gl.json", "plugins/**/locales/gl.json"],
            "dist/locales/sv.json": ["locales/sv.json", "plugins/**/locales/sv.json"],
            "dist/locales/fi.json": ["locales/fi.json", "plugins/**/locales/fi.json"],
            "dist/locales/ca.json": ["locales/ca.json", "plugins/**/locales/ca.json"]
        }
      }
    },
    ngAnnotate: {
      main: {
        files: {
        'temp/app.js':['temp/app.js'],
        'temp/lib.js': ['temp/lib.js'],
        'temp/libnocompat.js': ['temp/libnocompat.js']
        }
      }
    },
    uglify: {
      main: {
        options:{
          mangle: false,
          compress: {},
          beautify: true
        },
        files: {
          'dist/appCommon-vmaster.js': 'temp/app.js',
          'dist/libCommon-vmaster.js': 'temp/lib.js',
          'dist/libnocompat-vmaster.js': 'temp/libnocompat.js',
          'dist/avWidgets.js': 'avWidgets.js',

          "dist/locales/moment/es.js": "node_modules/moment/locale/es.js",
          "dist/locales/moment/fr.js": "node_modules/moment/locale/fr.js",
          "dist/locales/moment/gl.js": "node_modules/moment/locale/gl.js",
          "dist/locales/moment/ca.js": "node_modules/moment/locale/ca.js"
        }
      }
    },
    copy: {
      temp: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/nanoscroller/bin/css/', 
            src: ['*'],
            dest: 'temp/'
          },
          {
            expand: true,
            cwd: 'node_modules/intl-tel-input/build/css/', 
            src: ['*'],
            dest: 'temp/'
          }
        ]
      },
      main: {
        files: [
          {src: ['img/**'], dest: 'dist/'},
          {src: ['node_modules/intl-tel-input/build/img/flags.png'], dest: 'dist/img/flags.png'},
          {src: ['node_modules/intl-tel-input/build/js/utils.js'], dest: 'dist/utils.js'},
          {src: ['node_modules/intl-tel-input/build/css/intlTelInput.css'], dest: 'dist/intlTelInput.css'},
          {src: ['node_modules/nanoscroller/bin/css/*.css'], dest: 'temp/'},
          {src: ['temp_data/**'], dest: 'dist/'},
          {src: ['avUi/**/*.less'], dest: 'dist/less/'},
          {src: ['themes/**'], dest: 'dist/'},
          {
            expand: true,
            cwd: 'node_modules/bootstrap/fonts/',
            src: ['**'],
            dest: 'dist/themes/fonts/'
          },
          {
            src: ['fonts/Manrope-VariableFont_wght.ttf'],
            dest: 'dist/fonts/Manrope-VariableFont_wght.ttf'
          },
          {
            expand: true,
            cwd: 'node_modules/font-awesome/fonts/',
            src: ['**'],
            dest: 'dist/fonts/'
          }
          //{src: ['node_modules/angular-ui-utils/ui-utils-ieshiv.min.js'], dest: 'dist/'},
          //{src: ['node_modules/select2/*.png','node_modules/select2/*.gif'], dest:'dist/css/',flatten:true,expand:true},
          //{src: ['node_modules/angular-mocks/angular-mocks.js'], dest: 'dist/'}
        ]
      }
    },
    htmlmin: {
      main: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false,
          removeComments: false,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    imagemin: {
      main:{
        files: [{
          expand: true, cwd:'dist/',
          src:['**/{*.png,*.jpg}'],
          dest: 'dist/'
        }]
      }
    },
    karma: {
      options: {
        frameworks: ['jasmine'],
        files: [  //this files data is also updated in the watch handler, if updated change there too
          '<%= dom_munger.data.libnocompatjs %>',
          '<%= dom_munger.data.libjs %>',
          'SequentConfig.js',
          'SequentThemes.js',
          'avWidgets.js',
          '<%= dom_munger.data.appjs %>',
          '<%= ngtemplates.main.dest %>',
          'node_modules/angular-mocks/angular-mocks.js',
          '**/*.html',
          createFolderGlobs('*-spec.js')
        ],
        preprocessors: {
          'avRegistration/**/*.html': ['ng-html2js']
        },
        ngHtml2JsPreprocessor: {
          // the name of the Angular module to create
          moduleName: "avRegistration"
        },
        logLevel:'ERROR',
        reporters:['mocha'],
        autoWatch: false, //watching is handled by grunt-contrib-watch
        singleRun: true
      },
      all_tests: {
        browsers: ['PhantomJS','Chrome','Firefox']
      },
      headless: {
        browsers: ['PhantomJS']
      },
      during_watch: {
        browsers: ['PhantomJS']
      },
    },
    protractor: {
      options: {
        configFile: "node_modules/protractor/referenceConf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
        // Arguments passed to the command
        }
      },
      //your_target: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
        all: {
        options: {
          configFile: "e2e.conf.js", // Target-specific config file
          args: {} // Target-specific arguments
        }
      },
    }
  });

  grunt.registerTask(
    'build',
    [
      'check_config', 
      'jshint',
      'clean:before',
      'copy:temp',
      'less',
      'postcss',
      'dom_munger',
      'ngtemplates',
      'cssmin',
      'concat:main',
      'merge-json',
      'ngAnnotate',
      'uglify',
      'concat:postUglify',
      'copy:main',
      'htmlmin',
      'imagemin',
      'clean:after'
    ]
  );
  grunt.registerTask('serve', ['dom_munger:read','jshint','connect', 'watch']);
  grunt.registerTask('test',['dom_munger:read','karma:headless']);
  grunt.registerTask('test-all',['dom_munger:read','karma:all_tests']);

  grunt.event.on('watch', function(action, filepath) {
    //https://github.com/gruntjs/grunt-contrib-watch/issues/156

    var tasksToRun = [];

    if ((filepath.lastIndexOf('.json') !== -1 && filepath.lastIndexOf('.json') === filepath.length - 5) ||
        (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3)) {

      //lint the changed js file
      grunt.config('jshint.main.src', filepath);
      tasksToRun.push('jshint');

      //find the appropriate unit t est for the changed file
      var spec = filepath;
      if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
        spec = filepath.substring(0,filepath.length - 3) + '-spec.js';
      }

      //if the spec exists then lets run it
      if (grunt.file.exists(spec)) {
        var files = [].concat(grunt.config('dom_munger.data.libnocompatjs'));
        files.concat(grunt.config('dom_munger.data.libjs'));
        files.push('node_modules/angular-mocks/angular-mocks.js');
        files.push('SequentConfig.js');
        files.push('SequentThemes.js');
        files.push('avWidgets.js');
        files.concat(grunt.config('dom_munger.data.appjs'));
        files.concat(grunt.config('ngtemplates.main.dest'));
        files.push(spec);
        grunt.config('karma.options.files', files);
        tasksToRun.push('karma:during_watch');
      }
    }

    //if index.html changed, we need to reread the <script> tags so our next run of karma
    //will have the correct environment
    if (filepath === 'index.html') {
      tasksToRun.push('dom_munger:read');
    }

    grunt.config('watch.main.tasks',tasksToRun);

  });

  grunt.loadNpmTasks('grunt-protractor-runner');
};
