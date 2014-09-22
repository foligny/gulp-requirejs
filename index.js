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
        var optimizedArray = [];
        var self = this;
        optimizedArray = optimizedArray.concat(opts.module);
        _.each(optimizedArray, function(moduleName) {
            var file = parse.optimize(moduleStorage, moduleName, opts.path, opts.plugin, opts.recursive);
            if (file instanceof Error) {
                self.emit('error', new PluginError(PLUGIN_NAME, 'Missing required modules ' + file.message + ' in ' + moduleName));
            } else {
                self.push(file);
            }
        });
        callback();
    }

    return through(transformBuffer, flushBuffer);
};



