var gutil = require('gulp-util');
var through = require('through-gulp');
var path = require('path');
var parse = require('./src/parse.js');
var normalizer = require('./src/normalize-path.js');
var PluginError = gutil.PluginError;
var File = gutil.File;
var PLUGIN_NAME = 'gulp-requirejs-optimizer';

module.exports = function(opts) {
  if (!opts || !opts.module || !opts.baseUrl) {
  	  throw new PluginError(PLUGIN_NAME, 'Missing options for gulp-requirejs-optimizer');
  }
  var moduleStorage = {};
  var fullBasePath;

  function transformBuffer(file, encoding, callback) {
  	  if (file.isNull()) {
          this.push(file);
          callback();
  	  }

  	  if (file.isStream()) {
          this.emit('error', new PluginError(PLUGIN_NAME, 'Stream not supported'));
          this.push(file);
          callback();
  	  }

      if (file.isBuffer()) {
          fullBasePath = path.resolve(file.cwd, opts.baseUrl);
          var relativePath = normalizer.normalizeFileRelative(fullBasePath, file.path).replace(/\\/g, '/');
          var resolvedContents = parse.setModuleName(file.contents.toString(), relativePath);
          file.contents = new Buffer(resolvedContents);
          moduleStorage[relativePath] = file;
          callback();
      }
  }

  function flushBuffer(callback) {
      var file;
      var optimizedArray = [];
      var self = this;
      optimizedArray = optimizedArray.concat(opts.module);
      optimizedArray.forEach(function(value) {
          file = optimize(value);
          if (!file) {
              self.emit('error', new PluginError(PLUGIN_NAME, 'Missing required module'));
          } else {
              self.push(file);
          }
      });
      callback();
  }

  function optimize(moduleName) {
      var targetModule = normalizer.normalizeDependentRelative(fullBasePath, moduleName);
      var targetFile = moduleStorage[targetModule];
      var originalDependencies = parse.getModuleDependencies(targetFile.contents.toString());
      var dependentContents;
      var missingModule = originalDependencies.some(function(value) {
          return !moduleStorage[value];
      });
      if (missingModule) {
          return false;
      } else {
          dependentContents = originalDependencies.map(function(value) {
              return moduleStorage[value].contents.toString() + ';';
          });
          dependentContents.push(targetFile.contents.toString() + ';');
          return new File({
              path: targetModule + '.js',
              contents: new Buffer(dependentContents.join('\n'))
          });
      }
  }
  return through(transformBuffer, flushBuffer);
};



