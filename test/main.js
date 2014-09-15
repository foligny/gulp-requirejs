var gulp = require('gulp');
var assert = require('stream-assert-gulp');
var parse = require('../src/parse.js');
var gulpRequirejs = require('../index.js');
require('mocha');
require('should');

describe.skip('gulp-requirejs-errors', function () {
    it('should throw when options is missing', function () {
        (function() {
            gulp.src(['./test/fixtures/lang.js']).pipe(gulpRequirejs());
        })
        .should.throw('Missing options for gulp-requirejs-optimizer');
    });

    it('should emit error when streamed file', function (done) {
        gulp.src(['./test/fixtures/lang.js'], {buffer: false})
            .pipe(gulpRequirejs({}))
            .on('error', function(err) {
                err.message.should.eql('Stream not supported');
                done();
            });
    });

    it('should emit error when missing required modules', function (done) {
        gulp.src('./test/fixtures/*.js')
            .pipe(gulpRequirejs({
                baseUrl: './fixtures',
                path: {
                    "optimize-error": "optimize-error"
                },
                modules: [{name: 'optimize-error'}]
            }))
            .on('error', function(err) {
                err.message.should.eql('missing required modules');
                done();
            });
    });
});

describe.skip('gulp-requirejs-optimize', function () {
    it('should match the template file', function(done) {
        gulp.src('./test/fixtures/*.js')
            .pipe(gulpRequirejs({
                baseUrl: './fixtures',
                path: {
                    "optimize-info": "optimize-info"
                },
                modules: [{ name: 'optimize-info' }]
            }))
            .pipe(assert.first(function(file){
                var compare = "define('lang',[],function(){});define('logger',[],function(){});define('optimize-info',['lang','logger'],function(lang,logger){});";
                file.contents.toString().should.eql(compare);
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

    it('should set proper module name when pass-in', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.setModuleName(sample, 'example').replace(/\s*/g, "");
        result.should.equal("define('example',['lang','logger'],function(lang,logger){})");
    });

    it('should get empty module dependencies when undeclared', function () {
        sample = "define([], function(){return {};})";
        result = parse.getModuleDependencies(sample);
        result.should.be.empty;
    });

    it('should get proper module dependencies when declared', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.getModuleDependencies(sample);
        result.should.eql(['lang', 'logger']);
    });

    it('should push proper module dependencies when pass-in', function () {
        sample = "define([],function(){})";
        result = parse.pushModuleDependencies(sample, ['lang', 'logger']).replace(/\s*/g, "");
        result.should.equal("define(['lang','logger'],function(){})");
    });

});
