var admin_dest = 'www/admin';
var admin_src = 'admin';
var user_dest = 'www/user';
var user_src = 'user';
var dest = 'www';
var ts_options = {
    module: 'amd',
    target: 'es5',
    removeComments: true,
    sourceMap: false,
};
module.exports = function (grunt) {
    grunt.initConfig({
        shell: {
            admin: {
                command: `tsc -p admin`,
                options: {
                    failOnError: false
                }
            },
            user: {
                command: `tsc -p user`,
                options: {
                    failOnError: false
                }
            }
        },
        copy: {
            admin: {
                files: [
                    // { expand: true, cwd: admin_src, src: ['**/*.html'], dest: admin_dest },
                    // { expand: true, cwd: admin_src, src: ['**/*.js'], dest: admin_dest },
                    { expand: true, cwd: admin_src, src: ['**/*.css', '**/*.html', 'content/font/*.*'], dest: admin_dest },
                    // { expand: true, cwd: admin_src, src: ['fonts/**/*.*'], dest: admin_dest },
                    // { expand: true, cwd: admin_src, src: ['assets/font/*.*'], dest: admin_dest },
                    { expand: true, cwd: admin_src, src: ['scripts/ueditor/**/*.*'], dest: admin_dest },
                    { expand: true, cwd: 'scripts', src: ['*.js'], dest: `${admin_dest}/scripts` },

                    { expand: true, cwd: user_dest, src: ['userServices.js', 'controls/*.js'], dest: `${admin_dest}/mobile` },
                    { expand: true, cwd: `mobileComponents`, src: ['**/*.png'], dest: `${dest}/mobileComponents` },
                    { expand: true, cwd: `${dest}/common`, src: ['*.js'], dest: `${admin_dest}` },
                    { expand: true, cwd: `mobileComponents/dest/mobileComponents`, src: ['**/*.*'], dest: `${admin_dest}/mobileComponents` },
                    { expand: true, cwd: `lib/dest`, src: ['**/*.js'], dest: `${admin_dest}` },
                    // { expand: true, cwd: `mobileComponents`, src: ['*.html'], dest: `${admin_dest}/mobileComponents` }
                ]
            },
            admin_bt: {
                files: [
                    { expand: true, cwd: `${admin_src}/content/bootstrap-3.3.7/fonts`, src: ['*.*'], dest: `${admin_dest}/content/font` },
                ]
            },
            user: {
                files: [
                    { expand: true, cwd: user_src, src: ['**/*.html', '**/*.js', '**/*.css'], dest: user_dest },
                    { expand: true, cwd: `${admin_dest}/mobile`, src: ['**/control.*', '*.js'], dest: `${user_dest}` },
                    {
                        expand: true, cwd: user_src, dest: user_dest,
                        src: ['js/**/*.js', 'content/**/*.css', 'content/font/*.*', 'images/**/*.*', 'index.html'],
                    },
                ]
            }
        },
        stylus: {
            admin: {
                options: {
                    compress: false,
                },
                files: [
                    {
                        expand: true,
                        cwd: admin_src + '/content',
                        src: ['**/*.styl'],
                        dest: admin_dest + '/content',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: admin_src + '/modules',
                        src: ['**/*.styl'],
                        dest: admin_dest + '/modules',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: admin_src + '/mobile',
                        src: ['**/*.styl'],
                        dest: admin_dest + '/mobile',
                        ext: '.css'
                    }
                ]
            }
        },
        sass: {
            admin: {
                options: {
                    compress: false,
                },
                files: [
                    {
                        expand: true,
                        cwd: admin_src + '/content',
                        src: ['**/*.sass'],
                        dest: admin_dest + '/content',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: admin_src + '/modules',
                        src: ['**/*.sass'],
                        dest: admin_dest + '/modules',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: admin_src + '/mobile',
                        src: ['**/*.sass'],
                        dest: admin_dest + '/mobile',
                        ext: '.css'
                    }
                ]
            }
        },
        less: {
            admin: {
                files: [
                    {
                        expand: true,
                        cwd: `${admin_src}/modules`,
                        src: ['**/*.less'],
                        dest: `${admin_dest}/modules`,
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: `${admin_src}/content`,
                        src: ['**/*.less'],
                        dest: `${admin_dest}/content`,
                        ext: '.css'
                    },
                ]
            },
            user: {
                files: [
                    {
                        expand: true,
                        cwd: user_src + `/modules`,
                        src: ['**/*.less'],
                        dest: `${user_src}/content/app`,
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: user_src,
                        src: [`*.less`],
                        dest: `${user_src}/content/app`,
                        ext: '.css'
                    }
                ]
            },
            mobileComponents: {
                files: [
                    {
                        expand: true,
                        cwd: `mobileComponents`,
                        src: ['**/*.less'],
                        dest: `mobileComponents/dest/mobileComponents`,
                        ext: '.css'
                    },
                ]
            },
            user_bt: {
                files: [
                    { expand: false, src: `${user_src}/content/bootstrap_red.less`, dest: `${user_dest}/content/bootstrap_red.css` }
                ]
            },
            admin_bt: {
                files: [
                    { expand: false, src: `${admin_src}/content/bootstrap_blue.less`, dest: `${admin_dest}/content/bootstrap_bule.css` }
                ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('admin', ['shell:admin', 'sass:admin', 'less:admin', 'less:mobileComponents', 'stylus:admin', 'copy:admin']);
    grunt.registerTask('user', ['shell:user', 'less:user', 'copy:user']);
    grunt.registerTask('default', ['admin', 'user']);
    grunt.registerTask('admin_bt', ['less:admin_bt', 'copy:admin_bt']);
}