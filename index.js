var gutil = require('gulp-util');
var through = require('through-gulp');
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
  var opts = _.extend(defaultOpts, options);

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
          var invertConfigPath = _.invert(opts.path);
          var storageKey = null;
          var resolvedContents = null;
          if (_.has(invertConfigPath, relativePath)) {
              storageKey = invertConfigPath[relativePath];
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
      _.each(optimizedArray, function(moduleName) {
          file = optimize(moduleName);
          if (typeof file === 'string') {
              self.emit('error', new PluginError(PLUGIN_NAME, 'Missing required module ' + file + ' in ' + moduleName));
          } else {
              self.push(file);
          }
      });
      callback();
  }

  function optimize(moduleName) {
      // optimized module must be relative path, Maybe bug somewhere
      var targetModule = normalizer.normalizeDependentRelative(fullBasePath, moduleName);
      var targetFile = moduleStorage[targetModule];
      var originalDependencies = parse.getModuleDependencies(targetFile.contents.toString());
      var resolvedDependencies = [];
      var dependentContents = null;
      var missedModule = null;
      var configPath = opts.path;
      _.each(originalDependencies, function(dependency) {
          if (dependency.indexOf('!') === -1) {
              resolvedDependencies.push(dependency);
          } else if (dependency.indexOf('!') !== -1 && opts.plugin) {
              resolvedDependencies.push(dependency.split('!')[0])
          }
      });
      _.without(resolvedDependencies, 'module');
      var missingModule = _.some(resolvedDependencies, function(dependency) {
          if (!_.has(moduleStorage, dependency)) {
              missedModule = dependency;
              return true;
          } else {
              return false;
          }
      });

      if (missingModule) {
          return missedModule;
      } else {
          dependentContents = _.map(resolvedDependencies, function(dependency) {
              if (_.has(configPath, dependency) && configPath[dependency].indexOf('../') !== -1) {
                  return moduleStorage[dependency].contents.toString();
              }
              else {
                  return moduleStorage[dependency].contents.toString() + ';';
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



