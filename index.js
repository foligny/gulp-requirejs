var gutil = require('gulp-util');
var through = require('through-gulp');
var merge = require('merge');
var path = require('path');
var _ = require('underscore');
var parse = require('./src/parse.js');
var normalizer = require('./src/normalize-path.js');
var PluginError = gutil.PluginError;
var File = gutil.File;
var PLUGIN_NAME = 'gulp-requirejs-optimizer';

module.exports = function(options) {
  if (!options|| !options.module || !options.baseUrl) {
  	  throw new PluginError(PLUGIN_NAME, 'Missing options for gulp-requirejs-optimizer');
  }
  var moduleStorage = {};
  var fullBasePath;
  var defaultOpts = {
      baseUrl: '',
      path: {},
      module: [],
      plugin: true
  };
  var opts = merge(defaultOpts, options);

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
          var configPath = opts.path;
          var storageKey = null;
          var resolvedContents = null;
          var keys = _.keys(configPath);
          var values = _.values(configPath);
          if (values.indexOf(relativePath) !== -1) {
              var index = values.indexOf(relativePath);
              storageKey = keys[index];
          } else {
              storageKey = relativePath;
          }

          if (relativePath.indexOf('../') === -1) {
              resolvedContents = parse.setModuleName(file.contents.toString(), storageKey);
          } else {
              resolvedContents = file.contents.toString();
          }
          file.contents = new Buffer(resolvedContents);
          moduleStorage[storageKey] = file;
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
          if (typeof file === 'string') {
              self.emit('error', new PluginError(PLUGIN_NAME, 'Missing required module ' + file + ' in ' + value));
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
      var resolvedDependencies = [];
      var dependentContents = null;
      var missedModule = null;
      var configPath = opts.path;
      originalDependencies.forEach(function(moduleName) {
          if (moduleName.indexOf('!') === -1) {
              resolvedDependencies.push(moduleName);
          } else if (moduleName.indexOf('!') !== -1 && opts.plugin) {
              var pluginName = moduleName.split('!')[0];
              resolvedDependencies.push(pluginName);
          }
      });
      var missingModule = resolvedDependencies.some(function(value) {
          if (!moduleStorage[value]) {
              missedModule = value;
              return true;
          } else {
              return false;
          }
      });
      if (missingModule) {
          return missedModule;
      } else {
          dependentContents = resolvedDependencies.map(function(value) {
              if (_.has(configPath, value)) {
                  if (configPath[value].indexOf('../') !== -1) {
                      return moduleStorage[value].contents.toString();
                  } else {
                      return moduleStorage[value].contents.toString() + ';';
                  }
              }
              else {
                  return moduleStorage[value].contents.toString() + ';';
              }
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



