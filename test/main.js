var gulp = require('gulp');
var assert = require('stream-assert-gulp');
var parse = require('../src/parse.js');
var through = require('through-gulp');
var normalizer = require('../src/normalize-path.js');
var path = require('path');
var gulpRequirejs = require('../index.js');
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
                err.message.should.eql('Missing required module');
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

    it('should optimize single file without sub-directory', function(done) {
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

    it('should get empty module dependencies when undeclared', function () {
        sample = "define([], function(){return {};})";
        result = parse.getModuleDependencies(sample);
        result.should.be.empty;
    });

    it('should get empty module dependencies when missing', function () {
        sample = "define(function(){return {};})";
        result = parse.getModuleDependencies(sample);
        result.should.be.empty;
    });

    it('should get proper module dependencies when declared', function () {
        sample = "define(['lang','logger'],function(lang,logger){})";
        result = parse.getModuleDependencies(sample);
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