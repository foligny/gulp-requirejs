module.exports = {
    /**
     * @description
     * To get proper module name, judge if the name is absent
     * @param {string} fileContents  the original file content to analyze to get module name
     * @returns {string} the module name from file contents, empty when undeclared
     */
	getModuleName: function(fileContents) {
        return '';
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} fileContents  the original file content to analyze to get module dependencies name
     * @returns {array} the module dependencies name from file contents, empty when undeclared
     */
	getModuleDependencies: function(fileContents) {
        return [];
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} fileContents  the original file content to set explicit module name
     * @param {string} name  the proper name the module should be
     * @returns {string}  resolved file contents with module name, and ready for concat
     */
	setModuleName: function(fileContents, name) {
        return fileContents;
    }
};