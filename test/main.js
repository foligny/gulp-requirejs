var gulp = require('gulp');
var gutil = require('gulp-util');
var assert = require('stream-assert');
var parse = require('../src/parse.js');
var gulpRequirejs = require('../index.js');
require('mocha');
require('should');

describe('gulp-requirejs-optimizer', function () {
    describe('gulp-requirejs-errors', function () {
        it('should throw when options is missing', function () {
            (function(){
                gulp.src('.fixtures/lang.js').pipe(gulpRequirejs());
            }).should.throw('Missing options for gulp-requirejs-optimizer');
        });

        it('should throw when required option is missing', function() {
            (function(){
                gulp.src('./fixtures/lang.js').pipe(gulpRequirejs({}))
            }).should.throw('');
        });
    });

    describe('gulp-requirejs-optimize', function () {
        it.skip('should emit error when streamed file', function (done) {
            gulp.src('./fixtures/lang.js', {buffer: false})
                .pipe(gulpRequirejs({}))
                .on('error', function(err) {
                    err.message.should.eql('stream not supported');
                    done();
                })
        });

        it.skip('should emit error when missing required modules', function (done) {
            gulp.src('.fixtures/*.js')
                .pipe(gulpRequirejs({
                    baseUrl: './fixtures',
                    path: {
                        "optimize-error": "optimize-error"
                    },
                    modules: [
                        {
                            name: 'optimize-error'
                        }
                    ]
                }))
                .on('error', function(err) {
                    err.message.should.eql('missing required modules');
                    done();
                })
        });

        it('should match the template file', function(done) {
            gulp.src('.fixtures/*.js')
                .pipe(gulpRequirejs({
                    baseUrl: './fixtures',
                    path: {
                        "optimize-info": "optimize-info"
                    },
                    modules: [
                        {
                            name: 'optimize-info'
                        }
                    ]
                }))
                .pipe(assert.first(function(file){
                    var compare = "define('lang',[],function(){return 'language';});define('logger',[],function(){return 'logger';});define('optimize-info',['lang','logger'],function(lang,logger){});";
                    file.contents.toString().should.eql(compare);
                }))
                .on('end', done)
        })
    });
});

describe('parse module', function () {
    var sample;
    var result;

    beforeEach(function () {
        sample = null;
        result = null;
    });

    it('should get proper module dependencies when declared', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.getModuleDependencies(sample);
        result.should.eql(['lang', 'logger']);
    });

    it('should get empty module dependencies when undeclared', function () {
        sample = "define(function(){return {};})";
        result = parse.getModuleDependencies(sample);
        result.should.eql([]);
    });

    it('should set proper module name when pass-in', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.setModuleName(sample, 'example');
        result.should.eql("define('example',['lang','logger'],function(lang,logger){})");
    });

    it('should get proper module name when declared', function () {
        sample = "define('example',['lang','logger'],function(lang,logger){})";
        result = parse.getModuleName(sample);
        result.should.eql('example');
    });

    it('should get empty module name when undeclared', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.getModuleName(sample);
        result.should.be.empty;
    });
});
