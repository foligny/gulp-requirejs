var gutil = require('gulp-util');
var path = require('path');

module.exports = {
    /**
     * Normalize the relative path
     * @param {string} fullBasePath  The base path as beacon
     * @param filePath The full path to process
     * @returns {string} relative path
     */
    normalizeFileRelative: function(fullBasePath, filePath) {
        return gutil.replaceExtension(path.relative(fullBasePath, filePath), '');
    },

    /**
     * Normalize the relative path
     * @param {string} fullBasePath  The base path as beacon
     * @param {string} dependentPath  The relative path to process
     * @returns {string} relative path
     */
    normalizeDependentRelative: function(fullBasePath, dependentPath) {
        var fullDependentUrl = path.resolve(fullBasePath, dependentPath);
        return gutil.replaceExtension(path.relative(fullBasePath, fullDependentUrl), '');
    }
};