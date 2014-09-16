module.exports = {
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
            var tmp = null;
            if (typeof name === 'string') {
                result = fileContents;
            } else if (Object.prototype.toString.call(name) === '[object Array]') {
                result = "define('" + moduleName.toString() + "',[";
                name.forEach(function(value, key) {
                    if (key !== name.length-1) {
                        result += "'" + value.toString() + "',";
                    } else {
                        result += "'" + value.toString() + "'";
                    }
                });
                tmp = typeof dependencies !== 'undefined' ? dependencies.toString() : '';
                result +=  "]," + tmp + ")";
            } else {
                result = "define('" + moduleName.toString() + "'," + name.toString() + ")";
            }

            return result;
        };
        return eval(fileContents);
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} fileContents  the original file content to analyze to get module dependencies name
     * @returns {array} the module dependencies name from file contents, empty when undeclared
     */
	getModuleDependencies: function(fileContents) {
        var define = function(name, dependencies) {
            if (typeof name === 'string' && Object.prototype.toString.call(dependencies) === '[object Array]') {
                return dependencies;
            } else if (Object.prototype.toString.call(name) === '[object Array]') {
                return name;
            } else {
                return [];
            }
        };

        return eval(fileContents);
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
                console.log(name);
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
    }
};