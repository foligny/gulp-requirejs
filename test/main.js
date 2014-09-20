var gulp = require('gulp');
var gutil = require('gulp-util');
var assert = require('stream-assert-gulp');
var parse = require('../src/parse.js');
var through = require('through-gulp');
var normalizer = require('../src/normalize-path.js');
var path = require('path');
var gulpRequirejs = require('../index.js');
var File = gutil.File;
require('mocha');
require('should');

describe('gulp-requirejs-errors', function () {
    it('should throw when options is missing', function () {
        (function() {
            gulp.src(['./test/fixtures/lang.js']).pipe(gulpRequirejs());
        })
        .should.throw('Missing options for gulp-requirejs-optimizer');
    });

    it('should emit error when streamed file', function (done) {
        gulp.src(['./test/fixtures/lang.js'], {buffer: false})
            .pipe(gulpRequirejs({
                baseUrl: './test/fixture',
                module: 'main'
            }))
            .on('error', function(err) {
                err.message.should.eql('Stream not supported');
                done();
            });
    });

it('should emit error when missing required modules', function (done) {
     gulp.src('./test/fixtures/*.js')
         .pipe(gulpRequirejs({
             baseUrl: './test/fixtures',
             module: 'optimize-error'
         }))
         .on('error', function(err) {
             err.message.should.eql('Missing required modules ' + '["love"]' + ' in optimize-error');
             done();
         });
});
});

describe('gulp-requirejs-optimize', function () {
    it('should optimize single file without sub-directory', function(done) {
        gulp.src('./test/fixtures/*.js')
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                module: 'optimize-info'
            }))
            .pipe(assert.first(function(file){
                var compare = "define('lang',[],function(){});define('logger',[],function(){});define('optimize-info',['lang','logger'],function(lang,logger){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize single file with sub-directory', function(done) {
        gulp.src('./test/fixtures/**/*.js')
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                module: 'optimize-sub'
            }))
            .pipe(assert.first(function(file){
                var compare = "define('lang',[],function(){});define('subFixtures/html',[],function(){});define('optimize-sub',['lang','subFixtures/html'],function(lang,html){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize file with path config', function(done) {
        gulp.src('./test/fixtures/**/*.js')
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                path: {
                    'html': 'subFixtures/html'
                },
                module: 'optimize-path'
            }))
            .pipe(assert.first(function(file){
                var compare = "define('lang',[],function(){});define('html',[],function(){});define('optimize-path',['lang','html'],function(lang,html){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize file with path config', function(done) {
        gulp.src(['./test/fixtures/**/*.js','./test/mockLibs/**/*.js'])
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                path: {
                    'html': 'subFixtures/html',
                    'jquery': '../mockLibs/jquery',
                    'client': '../mockLibs/client'
                },
                module: 'optimize-outside'
            }))
            .pipe(assert.first(function(file){
                var compare = "define('html',[],function(){});(function(window){$=function(){}})(window);define('client',[],function(){});define('optimize-outside',['html','jquery','client'],function(html,jquery,client){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize multiple file', function(done) {
        gulp.src('./test/fixtures/**/*.js')
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                module: ['optimize-info','optimize-sub']
            }))
            .pipe(assert.first(function(file){
                var compare = "define('lang',[],function(){});define('logger',[],function(){});define('optimize-info',['lang','logger'],function(lang,logger){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .pipe(assert.last(function(file){
                var compare = "define('lang',[],function(){});define('subFixtures/html',[],function(){});define('optimize-sub',['lang','subFixtures/html'],function(lang,html){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize file with requirejs plugins with import plugin contents', function(done) {
        gulp.src(['./test/fixtures/optimize-plugin.js','./test/fixtures/plugins/*.js'])
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                path: {
                    'html': 'plugins/html',
                    'json': 'plugins/json',
                    'text': 'plugins/text'
                },
                module: 'optimize-plugin',
                plugin: true
            }))
            .pipe(assert.first(function(file){
                var compare = "define('html',['text'],function(text){});define('json',['text'],function(text){});define('optimize-plugin',['html!section','json!config'],function(section,config){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize file with requirejs plugins without import plugin contents', function(done) {
        gulp.src(['./test/fixtures/optimize-plugin.js','./test/fixtures/plugins/*.js'])
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                path: {
                    'html': 'plugins/html',
                    'json': 'plugins/json',
                    'text': 'plugins/text'
                },
                module: 'optimize-plugin',
                plugin: false
            }))
            .pipe(assert.first(function(file){
                var compare = "define('optimize-plugin',['html!section','json!config'],function(section,config){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize file with requirejs plugins import plugin contents recursively', function(done) {
        gulp.src(['./test/fixtures/optimize-recursive-plugin.js','./test/fixtures/plugins/*.js'])
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                path: {
                    'html': 'plugins/html',
                    'json': 'plugins/json',
                    'text': 'plugins/text'
                },
                module: 'optimize-recursive-plugin',
                plugin: true,
                recursive: true
            }))
            .pipe(assert.first(function(file){
                var compare = "define('text',['module'],function(module){});define('html',['text'],function(text){});define('json',['text'],function(text){});define('optimize-recursive-plugin',['html!section','json!config'],function(section,config){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });

    it('should optimize file without plugins recursively', function(done) {
        gulp.src(['./test/fixtures/*.js'])
            .pipe(gulpRequirejs({
                baseUrl: './test/fixtures',
                module: 'optimize-recursive',
                recursive: true
            }))
            .pipe(assert.first(function(file){
                var compare = "define('lang',[],function(){});define('client',['lang'],function(lang){});define('optimize-recursive',['client'],function(client){});";
                (file.contents.toString().replace(/\s*/g, '')).should.eql(compare);
            }))
            .on('end', done);
    });
});

describe('parse module', function () {
    var sample;
    var result;

    beforeEach(function () {
        sample = null;
        result = null;
    });

    it('should resolve plugin dependencies with persist', function () {
        sample = ['client','html!section', 'json!config'];
        result = parse.resolvePluginDependencies(sample, true);
        result.should.eql(['client','html','json']);
    });

    it('should resolve plugin dependencies without persist', function () {
        sample = ['client','html!section', 'json!config'];
        result = parse.resolvePluginDependencies(sample, false);
        result.should.eql(['client']);
    });

    it('should resolve recursive dependencies with plugins', function () {
        var container = {
            text: new File({
                path: "text.js",
                contents: new Buffer("define('text',[],function(){}")
            }),
            html: new File({
                path: "html.js",
                contents: new Buffer("define('html',['" + "text']," + "function(){})")
            }),
            theme: new File({
                path: "theme.js",
                contents: new Buffer("define('theme',['" + "html!section']," + "function(section){})")
            })
        };
        result = parse.getRecursiveModuleDependencies(container, container.theme, true);
        result.should.eql(['text','html']);
    });

    it('should resolve recursive dependencies without plugins', function () {
        var container = {
            client: new File({
                path: "client.js",
                contents: new Buffer("define('client',[],function(){}")
            }),
            server: new File({
                path: "server.js",
                contents: new Buffer("define('server',['" + "client']," + "function(){})")
            }),
            theme: new File({
                path: "theme.js",
                contents: new Buffer("define('theme',['" + "server']," + "function(){})")
            })
        };
        result = parse.getRecursiveModuleDependencies(container, container.theme);
        result.should.eql(['client','server']);
    });

    it('should optimize specific module without plugin and recursive', function () {
        var container = {
            client: new File({
                path: "client.js",
                contents: new Buffer("define('client',[],function(){}")
            }),
            server: new File({
                path: "server.js",
                contents: new Buffer("define('server',['" + "client']," + "function(){})")
            }),
            text: new File({
                path: "text.js",
                contents: new Buffer("define('text',[],function(){}")
            }),
            html: new File({
                path: "html.js",
                contents: new Buffer("define('html',['" + "text']," + "function(){})")
            }),
            theme: new File({
                path: "theme.js",
                contents: new Buffer("define('theme',['" + "server','html!section']," + "function(){})")
            })
        };
        sample ="define('server',['" + "client']," + "function(){})" + ';' + "define('theme',['" + "server','html!section']," + "function(){})" + ';';
        result = parse.optimize(container, 'theme', {} , false, false);
        (result.contents.toString().replace(/\s*/g, '')).should.eql(sample);
    });

    it('should optimize specific module with plugins none recursive', function () {
        var container = {
            client: new File({
                path: "client.js",
                contents: new Buffer("define('client',[],function(){}")
            }),
            server: new File({
                path: "server.js",
                contents: new Buffer("define('server',['" + "client']," + "function(){})")
            }),
            text: new File({
                path: "text.js",
                contents: new Buffer("define('text',[],function(){}")
            }),
            html: new File({
                path: "html.js",
                contents: new Buffer("define('html',['" + "text']," + "function(){})")
            }),
            theme: new File({
                path: "theme.js",
                contents: new Buffer("define('theme',['" + "server', 'html!section']," + "function(){})")
            })
        };
        sample = "define('server',['" + "client']," + "function(){})" + ';' + "define('html',['" + "text']," + "function(){})" + ';' + "define('theme',['" + "server','html!section']," + "function(){})" + ';';
        result = parse.optimize(container, 'theme', {}, true, false);
        (result.contents.toString().replace(/\s*/g, '')).should.eql(sample);
    });

    it('should optimize specific module without plugin but recursive', function () {
        var container = {
            client: new File({
                path: "client.js",
                contents: new Buffer("define('client',[],function(){}")
            }),
            server: new File({
                path: "server.js",
                contents: new Buffer("define('server',['" + "client']," + "function(){})")
            }),
            text: new File({
                path: "text.js",
                contents: new Buffer("define('text',[],function(){}")
            }),
            html: new File({
                path: "html.js",
                contents: new Buffer("define('html',['" + "text']," + "function(){})")
            }),
            theme: new File({
                path: "theme.js",
                contents: new Buffer("define('theme',['" + "server','html!section']," + "function(){})")
            })
        };
        sample = "define('client',[],function(){}" + ';' + "define('server',['" +"client']," + "function(){})" + ';' + "define('theme',['" + "server','html!section']," + "function(){})" + ';' ;
        result = parse.optimize(container, 'theme', {} , false, true);
        (result.contents.toString().replace(/\s*/g, '')).should.eql(sample);
    });

    it('should optimize specific module with plugins and recursive', function () {
        var container = {
            client: new File({
                path: "client.js",
                contents: new Buffer("define('client',[],function(){}")
            }),
            server: new File({
                path: "server.js",
                contents: new Buffer("define('server',['" + "client']," + "function(){})")
            }),
            text: new File({
                path: "text.js",
                contents: new Buffer("define('text',[],function(){}")
            }),
            html: new File({
                path: "html.js",
                contents: new Buffer("define('html',['" + "text']," + "function(){})")
            }),
            theme: new File({
                path: "theme.js",
                contents: new Buffer("define('theme',['" + "server','html!section']," + "function(){})")
            })
        };
        sample = "define('client',[],function(){}" + ';' + "define('text',[],function(){}" + ';' + "define('server',['" + "client']," + "function(){})" + ';' + "define('html',['" + "text']," + "function(){})" + ';' + "define('theme',['" + "server','html!section']," + "function(){})" + ';';
        result = parse.optimize(container, 'theme', {} , true, true);
        (result.contents.toString().replace(/\s*/g, '')).should.eql(sample);
    });

    it('should checkout dependency missed when all provided', function () {
        var container = {
            client: "define('client',[],function(){})",
            server: "define('server',[],function(){})",
            theme: "define('theme',[],function(){})"
        };
        sample = ['client', 'server', 'theme'];
        result = parse.checkDependencyMiss(container, sample);
        result.should.be.empty;
    });

    it('should checkout dependency missed when some missed', function () {
        var container = {
            client: "define('client',[],function(){})",
            server: "define('server',[],function(){})",
            theme: "define('theme',[],function(){})"
        };
        sample = ['client', 'database', 'windows'];
        result = parse.checkDependencyMiss(container, sample);
        result.should.eql(['database', 'windows']);
    });

    it('should get empty module name when undeclared', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.getModuleName(sample);
        result.should.be.empty;
    });

    it('should get proper module name when declared', function () {
        sample = "define('example',['lang','logger'],function(lang,logger){})";
        result = parse.getModuleName(sample);
      result.should.equal('example');
    });

    it('should not set proper module name when already have name', function () {
        sample = "define('sample',['lang','logger'],function(lang,logger){})";
        result = parse.setModuleName(sample, 'example').replace(/\s*/g, "");
        result.should.equal("define('sample',['lang','logger'],function(lang,logger){})");
    });

    it('should set proper module name when pass-in', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.setModuleName(sample, 'example').replace(/\s*/g, "");
        result.should.equal("define('example',['lang','logger'],function(lang,logger){})");
    });

    it('should set proper module name when pass-in', function () {
          sample = "define(function(lang,logger){})";
          result = parse.setModuleName(sample, 'example').replace(/\s*/g, "");
          result.should.equal("define('example',function(lang,logger){})");
    });

    it('should set proper module name when pass-in', function () {
        sample = 'define({"name" : "500 days with summer","type" : "comedy"})';
        result = parse.setModuleName(sample, 'example').replace(/\s*/g, "");
        result.should.equal("define('example'," + '{"name":"500 days with summer","type":"comedy"}'.replace(/\s*/g, "") + ')');
    });

    it('should get empty module dependencies when undeclared', function () {
        var container = {
            sample : new File({
                path: "sample.js",
                contents: new Buffer("define([], function(){return {};})")
            })
        };
        result = parse.getModuleDependencies(container, container.sample, false);
        result.should.be.empty;
    });

    it('should get empty module dependencies when missing', function () {
        var container = {
            sample : new File({
                path: "sample.js",
                contents: new Buffer("define(function(){return {};})")
            })
        };
        result = parse.getModuleDependencies(container, container.sample, false);
        result.should.be.empty;
    });

    it('should get proper module dependencies when declared', function () {
        var container = {
            sample : new File({
                path: "sample.js",
                contents: new Buffer("define(['lang','logger'],function(lang,logger){})")
            })
        };
        result = parse.getModuleDependencies(container, container.sample, false);
        result.should.eql(['lang', 'logger']);
    });

    it('should push proper module dependencies when pass-in with module name', function () {
        sample = "define('sample',[],function(){})";
        result = parse.pushModuleDependencies(sample, ['lang', 'logger']).replace(/\s*/g, "");
        result.should.equal("define('sample',['lang','logger'],function(){})");
    });

    it('should push proper module dependencies when pass-in without module name', function () {
        sample = "define([],function(){})";
        result = parse.pushModuleDependencies(sample, ['lang', 'logger']).replace(/\s*/g, "");
        result.should.equal("define(['lang','logger'],function(){})");
    });

    it('should push proper module dependencies when pass-in without module dependency', function () {
        sample = "define(function(){})";
        result = parse.pushModuleDependencies(sample, ['lang', 'logger']).replace(/\s*/g, "");
        result.should.equal("define(['lang','logger'],function(){})");
    });
});

describe('normalize path module', function () {
    it('should normalize file path', function (done) {
        gulp.src(['./test/fixtures/lang.js'])
            .pipe(through(function(file, encoding, callback) {
                var basePath = './test';
                var fullBasePath = path.resolve(file.cwd, basePath);
                var relativePath = normalizer.normalizeFileRelative(fullBasePath, file.path);
                relativePath.should.equal(path.join('fixtures', 'lang'));
                callback();
                done();
        }));
    });

    it('should normalize dependent path', function (done) {
        gulp.src(['./test/fixtures/lang.js'])
            .pipe(through(function(file, encoding, callback) {
                var basePath = './test';
                var fullBasePath = path.resolve(file.cwd, basePath);
                var fileRelativePath = normalizer.normalizeFileRelative(fullBasePath, file.path);
                var dependentRelativePath = normalizer.normalizeDependentRelative(fullBasePath, './fixtures/lang');
                fileRelativePath.should.equal(dependentRelativePath);
                callback();
                done();
            }));
    });
});