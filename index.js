var gutil = require('gulp-util');
var through = require('through');
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
  	  return false;
  	}

  	if (file.isStream()) {
      return this.emit('error', new PluginError(PLUGIN_NAME, 'stream not supported'));
  	}

    var options = merge({
      baseUrl: './modules',
      path: {},
      shim: {}
    }, opts);

    /*
     * To get the same relative path, and storage file content as K-V
     */
    var fullBaseUrl = path.resolve(file.cwd, options.baseUrl);
    var relativeUrl = gutil.replaceExtension(path.relative(fullBaseUrl, file.path), '');
    moduleStorage[relativeUrl] = file;
  }

  function flushBuffer() {
      this.emit('data', moduleStorage['b']);
      this.emit('end');
  }

  return through(transformBuffer, flushBuffer);
};



