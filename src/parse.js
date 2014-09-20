var _ = require('underscore');
var gutil = require('gulp-util');
var File = gutil.File;
var parse;
parse = {
    missedModules: [],
    /**
     * @description
     * To get proper module name, judge if the name is absent
     * @param {string} fileContents  the original file content to analyze to get module name
     * @returns {string} the module name from file contents, empty when undeclared
     */
	getModuleName: function(fileContents) {
        var define = function(name) {
            if (typeof name === 'string') {
                return name;
            } else {
                return '';
            }
        };

        return eval(fileContents);
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} fileContents  the original file content to set explicit module name
     * @param {string} moduleName  the proper name the module should be
     * @returns {string}  resolved file contents with module name, and ready for concat
     */
    setModuleName: function(fileContents, moduleName) {
        var define = function(name, dependencies) {
            var result = null;
            var structure = null;
            if (_.isString(name)) {
                result = fileContents;
                return result;
            }

            if (_.isArray(name)) {
                result = "define('" + moduleName.toString() + "',[";
                name.forEach(function(value, key) {
                    if (key !== name.length-1) {
                        result += "'" + value.toString() + "',";
                    } else {
                        result += "'" + value.toString() + "'";
                    }
                });

                if (_.isFunction(dependencies)) {
                    structure = dependencies.toString();
                }
                if (_.isObject(dependencies) && !_.isFunction(dependencies)) {
                    structure = JSON.stringify(dependencies);
                }

                result +=  "]," + structure + ")";
                return result;
            }

            if (_.isFunction(name)) {
                structure = name.toString();
            }
            if (_.isObject(name) && !_.isFunction(name)) {
                structure = JSON.stringify(name);
            }
            result = "define('" + moduleName.toString() + "'," + structure + ")";
            return result;
        };
        return eval(fileContents);
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} file  the original file analyze get module dependencies
     * @returns {array} the module dependencies name from file contents, empty when undeclared
     */
	getModuleDependencies: function(file) {
        var define = function(name, dependencies) {
            if (typeof name === 'string' && Object.prototype.toString.call(dependencies) === '[object Array]') {
                return dependencies;
            } else if (Object.prototype.toString.call(name) === '[object Array]') {
                return name;
            } else {
                return [];
            }
        };
        return eval(file.contents.toString());
    },

    /**
     * @description
     * To get dependency array recursively.
     * @param {object} container the container to reserve files
     * @param {string} file  the original file to analyze to get module dependencies
     * @param {boolean} keepPlugin  whether reserve plugins dependency
     * @returns {array} the resolved dependency array
     */
    getRecursiveModuleDependencies: function(container, file, keepPlugin) {
        var initialDependency = parse.getModuleDependencies(file);
        var pluginResolvedDependency = parse.resolvePluginDependencies(initialDependency, keepPlugin);
        var directProvisionDependencies = [];
        var recursiveProvisionDependencies = [];
        var finalDependencies = [];
        _.each(pluginResolvedDependency, function(dependency) {
            directProvisionDependencies.push(dependency);
            recursiveProvisionDependencies = _.union(recursiveProvisionDependencies, parse.getModuleDependencies(container[dependency]));
        });
        finalDependencies = _.union(recursiveProvisionDependencies, directProvisionDependencies);
        finalDependencies = _.without(finalDependencies, 'module');
        return finalDependencies;
    },
    /**
     * @description
     * To push proper module dependencies name.
     * @param {string} fileContents  the original file content to analyze to get module dependencies name
     * @param {array} moduleNames the module dependency to add, normally used for recursive.
     * @returns {array} the module dependencies name from file contents, empty when undeclared
     */
    pushModuleDependencies: function(fileContents, moduleNames) {
        var define = function(name, dependencies, structure) {
            var result = null;
            var deps = null;
            var implement = null;
            if (typeof name === 'string' && Object.prototype.toString.call(dependencies) === '[object Array]') {
                result = "define('" + name.toString() + "',[" ;
                deps = dependencies.concat(moduleNames);
                implement = typeof structure !== 'undefined'? structure : '';
            } else if (Object.prototype.toString.call(name) === '[object Array]') {
                result = "define([";
                deps = name.concat(moduleNames);
                implement = dependencies;
            } else {
                result = "define([";
                deps = moduleNames;
                implement = name;
            }

            deps.forEach(function(value, key) {
                if (key !== deps.length-1) {
                    result += "'" + value.toString() + "',";
                } else {
                    result += "'" + value.toString() + "'";
                }
            });
            result +=  "]," + implement.toString() + ")";
            return result;
        };

        return eval(fileContents);
    },

    /**
     * @description
     * To resolve dependency array with plugin usage.
     * @param {array} initialDependencies the original dependency array to resolve.
     * @param {boolean} keepPlugin whether reserve plugins.
     * @returns {array} the resolved dependency array
     */
    resolvePluginDependencies: function(initialDependencies, keepPlugin) {
        var resolvedResult = [];
        _.each(initialDependencies, function(dependency) {
            if (dependency.indexOf('!') === -1) {
                resolvedResult.push(dependency);
            }
            if (dependency.indexOf('!') !== -1 && keepPlugin) {
                resolvedResult.push(dependency.split('!')[0]);
            }
        });

        return resolvedResult;
    },

    checkDependencyMiss: function(container, dependencies) {
        var missedModule = [];
        _.each(dependencies, function(dependency) {
            if (!_.has(container, dependency)) {
                missedModule.push(dependency);
            }
        });

        return missedModule;
    },

    /**
     * @description
     * To optimize specific module.
     * @param {object} container the container to reserve files
     * @param {string} moduleName  the module to optimize
     * @param {string} config  path config options
     * @param {boolean} keepPlugin  whether reserve the plugins
     * @param {boolean} recursive  whether optimize recursively
     * @returns {string} the dependencies contents
     */
    optimize: function(container, moduleName, config, keepPlugin, recursive) {
        var dependencies = [];
        var dependenciesContents = '';
        var configPath = _.extend({}, config);
        if (!!recursive) {
            dependencies = parse.getRecursiveModuleDependencies(container, container[moduleName], keepPlugin);
        } else {
            dependencies = parse.getModuleDependencies(container[moduleName]);
        }
        dependencies = parse.resolvePluginDependencies(dependencies, keepPlugin);
        dependenciesContents = _.map(dependencies, function(dependency) {
            if (_.has(configPath, dependency) && configPath[dependency].indexOf('../') !== -1) {
                return container[dependency].contents.toString();
            }
            else {
                return container[dependency].contents.toString() + ';';
            }
        });
        dependenciesContents.push(container[moduleName].contents.toString() + ';');
        return new File({
            path: moduleName + '.js',
            contents: new Buffer(dependenciesContents.join('\n'))
        });
    }
};

module.exports = parse;