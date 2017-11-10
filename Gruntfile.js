var admin_src = 'client/admin';
var user_src = 'client/user';
var out = 'www';

var admin_dest = `${out}/admin`;
var user_dest = `${out}/user`;

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
                command: `tsc -p ${admin_src}`,
                options: {
                    failOnError: false
                }
            },
            user: {
                command: `tsc -p ${user_src}`,
                options: {
                    failOnError: false
                }
            }
        },
        copy: {
            admin: {
                files: [{
                        expand: true,
                        cwd: admin_src,
                        src: ['**/*.css', '**/*.html', 'content/font/*.*'],
                        dest: admin_dest
                    },
                    {
                        expand: true,
                        cwd: 'lib',
                        src: ['ueditor/**/*.*'],
                        dest: `${admin_dest}/scripts`
                    },
                    {
                        expand: true,
                        cwd: 'lib',
                        src: ['umeditor/**/*.*'],
                        dest: `${admin_dest}/scripts`
                    },
                    {
                        expand: true,
                        cwd: 'lib',
                        src: ['*.js'],
                        dest: `${admin_dest}/scripts`
                    },
                    {
                        expand: true,
                        cwd: `${admin_src}/lib/bootstrap-3.3.7/fonts`,
                        src: ['*.*'],
                        dest: `${admin_dest}/content/font`
                    },
                    // { expand: true, cwd: 'lib/dest', src: ['*.js'], dest: `${admin_dest}` },
                    // { expand: true, cwd: `${user_src}/dest`, src: ['userServices.js'], dest: `${admin_dest}/mobile` }
                ]
            },
            user: {
                files: [{
                        expand: true,
                        cwd: user_src,
                        src: ['**/*.html', '**/*.css', '**/*.png', 'content/font/*.*'],
                        dest: user_dest
                    },
                    {
                        expand: true,
                        cwd: 'lib',
                        src: ['*.js'],
                        dest: `${user_dest}/scripts`
                    },
                    {
                        expand: true,
                        cwd: `${user_src}/dest`,
                        src: ['*.js'],
                        dest: `${user_dest}`
                    }
                ]
            }
        },
        less: {
            admin: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: `${admin_src}`,
                    src: ['**/*.less'],
                    dest: `${admin_dest}`,
                    ext: '.css'
                }, ]
            },
            user: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: user_src,
                    src: [`**/*.less`],
                    dest: `${user_dest}`,
                    ext: '.css',
                    filter: function (filepath) {
                        if (filepath.endsWith('style.less'))
                            return false;

                        return true;
                    }
                }]
            },
            mobileComponents: {
                files: [{
                    expand: true,
                    cwd: `mobileComponents`,
                    src: ['**/*.less'],
                    dest: `mobileComponents/dest/mobileComponents`,
                    ext: '.css'
                }, ]
            },
            // user_bt: {
            //     files: [
            //         { expand: false, src: `${user_src}/content/bootstrap_red.less`, dest: `${user_dest}/content/bootstrap_red.css` }
            //     ]
            // },
            // admin_bt: {
            //     files: [
            //         { expand: false, src: `${admin_src}/content/bootstrap_blue.less`, dest: `${admin_dest}/content/bootstrap_bule.css` }
            //     ]
            // }
        },
        requirejs: {
            user: {
                options: {
                    baseUrl: 'www/user',
                    include: [
                        'index', 'css', 'userServices/service', 'userServices/shoppingService',
                        'mobileComponents/common', 'modules/page','polyfill'
                    ], 
                    out: 'www/user/build.js',
                    optimize: 'none',
                    paths: {
                        // chitu: 'scripts/chitu',
                        polyfill: '../../node_modules/babel-polyfill/dist/polyfill.min',

                        css: 'scripts/css',
                        fetch: 'scripts/fetch',
                        hammer: 'scripts/hammer',
                        react: 'scripts/react',
                        'react-dom': 'scripts/react-dom',
                        text: 'scripts/text',
                        // 'chitu.mobile': 'scripts/chitu.mobile',
                        carousel: 'scripts/carousel',
                        services: 'userServices',
                        // mobileComponents: 'pageComponents',
                        formValidator: 'scripts/formValidator',
                        mobileControls: 'scripts/mobileControls',
                        ui: 'scripts/ui',
                        'maishu-chitu': 'chitu'
                    }
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-sass');
    // grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('admin', ['shell:admin', 'less:admin', 'less:mobileComponents', 'copy:admin']);
    grunt.registerTask('user', ['shell:user', 'less:user', 'copy:user']);
    grunt.registerTask('default', ['admin', 'user']);
    grunt.registerTask('admin_bt', ['less:admin_bt', 'copy:admin_bt']);
}

/**
 * 说明：
 * lib/src/ui lib/src/mobileControls lib/src
 * １.编译顺序 user/service user/pageComponents user admin
 */