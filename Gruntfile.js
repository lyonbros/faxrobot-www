module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
        js : {
            src : [
                'config/constants.js',
                'config/routes.js',
                'library/util.js',
                'library/cowcrypt/convert.js',
                'library/cowcrypt/hasher.js',
                'library/cowcrypt/md5.js',
                'faxrobot.js',
                'controllers/_base_modal.js',
                'controllers/**/*.js',
                'handlers/*.js',
                'models/*.js'
            ],
            dest : 'faxrobot.min.js'
        }
    },
    uglify : {
        js: {
            files: {
                'faxrobot.min.js' : [ 'faxrobot.min.js' ]
            }
        },
        libs: {
            options: {
                preserveComments: 'all'
            },
            files: {
                'library/library.min.js': [
                    'library/underscore-1.7.0.min.js',
                    'library/history/History.js',
                    'library/history/history.adapter.native.js',
                    'library/composer-1.1.6.5.min.js'
                ]
            }
        }
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "css/faxrobot.css": "css/less/faxrobot.less"
        }
      }
    },
    watch: {
      styles: {
        files: [
          'css/less/*.less',
        ], // which files to watch
        tasks: [
          'less'
        ],
        options: {
          nospawn: true,
          debounceDelay: 250
        }
      },
      scripts: {
        files: [
          'config/*.js',
          'library/util.js',
          'faxrobot.js',
          'controllers/**/*.js',
          'handlers/*.js',
          'models/*.js'
        ],
        tasks: [
          'concat', 'uglify'
        ],
        options: {
          nospawn: true,
          debounceDelay: 250
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['watch']);
};
