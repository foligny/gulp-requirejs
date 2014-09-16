var gutil = require('gulp-util');
var through = require('through-gulp');
var path = require('path');
var parse = require('./src/parse.js');
var PluginError = gutil.PluginError;
var File = gutil.File;
var PLUGIN_NAME = 'gulp-requirejs-optimizer';

module.exports = function(opts) {
  if (!opts || !opts.module) {
  	  throw new PluginError(PLUGIN_NAME, 'Missing options for gulp-requirejs-optimizer');
  }
  var moduleStorage = {};

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
          var fullBaseUrl = path.resolve(file.cwd, opts.baseUrl);
          var relativeUrl = gutil.replaceExtension(path.relative(fullBaseUrl, file.path), '');
          var content = parse.setModuleName(file.contents.toString(), relativeUrl);
          file.contents = new Buffer(content);
          moduleStorage[relativeUrl] = file;
          callback();
      }
  }

  function flushBuffer(callback) {
      var targetModule = opts.module;
      var targetFile = moduleStorage[targetModule];
      var dependencies = parse.getModuleDependencies(targetFile.contents.toString());
      var dependentContents;
      var missingModule = false;
      dependencies.forEach(function(value) {
          if (!moduleStorage[value]) {
              missingModule = true;
          }
      });

      if (missingModule) {
          this.emit('error', new PluginError(PLUGIN_NAME, 'Missing required module'));
          callback();
      } else {
          dependentContents = dependencies.map(function(value) {
              return moduleStorage[value].contents.toString() + ';';
          });
          dependentContents.push(targetFile.contents.toString() + ';');
          var file = new File({
              path: targetModule + '.js',
              contents: new Buffer(dependentContents.join('\n'))
          });
          this.push(file);
          callback();
      }
  }

  return through(transformBuffer, flushBuffer);
};



