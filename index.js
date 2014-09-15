var gutil = require('gulp-util');
var through = require('through-gulp');
var path = require('path');
var merge = require('merge');
var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-requirejs-optimizer';

module.exports = function(opts) {
  if (!opts) {
  	  throw new PluginError(PLUGIN_NAME, 'Missing options for gulp-requirejs-optimizer');
  }
  var moduleStorage = {};

  function transformBuffer(file) {
  	  if (file.isNull()) {

  	  }

  	  if (file.isStream()) {

  	  }

      if (file.isBuffer()) {
          var options = merge({
              baseUrl: './modules',
              path: {},
              shim: {}
          }, opts);

          var fullBaseUrl = path.resolve(file.cwd, options.baseUrl);
          var relativeUrl = gutil.replaceExtension(path.relative(fullBaseUrl, file.path), '');
          moduleStorage[relativeUrl] = file;
      }
  }

  function flushBuffer(callback) {
      callback();
  }

  return through(transformBuffer, flushBuffer);
};



