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
      plugin: false,
      recursive: false
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

  function getFinalModuleDependencies(container, moduleName, recursive) {
      var initialDependencies = parse.getModuleDependencies(container[moduleName].contents.toString());
      var initialPluginResolvedDependencies =_.without(resolvePluginDependencies(initialDependencies), 'module');
      try {
          checkDependencyMiss(container, initialPluginResolvedDependencies);
      } catch (err) {
          throw err;
      }

      if (!recursive) {
          return initialPluginResolvedDependencies;
      }

      var directProvisionDependencies = [];
      var recursiveProvisionDependencies = [];
      var finalDependencies = [];
      _.each(initialPluginResolvedDependencies, function(dependency) {
          recursiveProvisionDependencies = _.union(recursiveProvisionDependencies, parse.getModuleDependencies(container[dependency].contents.toString()));
          directProvisionDependencies.push(dependency);
      });
      finalDependencies = _.union(recursiveProvisionDependencies, directProvisionDependencies);
      finalDependencies = _.without(finalDependencies, 'module');
      try {
          checkDependencyMiss(container, finalDependencies);
          return finalDependencies;
      } catch (err) {
          throw err;
      }
  }

  function resolvePluginDependencies(initialDependencies) {
      var resolvedResult = [];
      _.each(initialDependencies, function(dependency) {
          if (dependency.indexOf('!') === -1) {
              resolvedResult.push(dependency);
          }
          if (dependency.indexOf('!') !== -1 && opts.plugin) {
              resolvedResult.push(dependency.split('!')[0]);
          }
      });

      return resolvedResult;
  }
  function checkDependencyMiss(container, dependencies) {
      _.each(dependencies, function(dependency) {
          if (!_.has(container, dependency)) {
              throw new Error(dependency.toString());
          }
      });
  }
  function optimize(moduleName) {
      // optimized module must be relative path, Maybe bug somewhere
      var targetModuleName = normalizer.normalizeDependentRelative(fullBasePath, moduleName);
      var configPath = opts.path;
      var finalDependencies;
      var finalDependentContents;
      try {
          finalDependencies = getFinalModuleDependencies(moduleStorage, targetModuleName, opts.recursive);
          finalDependentContents = _.map(finalDependencies, function(dependency) {
              if (_.has(configPath, dependency) && configPath[dependency].indexOf('../') !== -1) {
                  return moduleStorage[dependency].contents.toString();
              }
              else {
                  return moduleStorage[dependency].contents.toString() + ';';
              }
          });
          finalDependentContents.push(moduleStorage[targetModuleName].contents.toString() + ';');
          return new File({
              path: targetModuleName + '.js',
              contents: new Buffer(finalDependentContents.join('\n'))
          });
      } catch (err) {
          return err.message;
      }
  }
  return through(transformBuffer, flushBuffer);
};



