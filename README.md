gulp-requirejs
==============
![Build Status](https://img.shields.io/travis/bornkiller/gulp-requirejs/master.svg?style=flat)
![Package Dependency](https://david-dm.org/bornkiller/gulp-requirejs.svg?style=flat)
![Package DevDependency](https://david-dm.org/bornkiller/gulp-requirejs/dev-status.svg?style=flat)

Parallel migration from grunt-contrib-requirejs to gulp-requirejs

#Warning
The project start from 2014/09/10, and far away from production environment.
welcome any pull request, I promise to lookup any modification, or just become collaborator through
send me an email hjj491229492@hotmail.com.

## Schedule
+ make unit test ready before 2014/09/14.
+ provide an extremely simplify r.js for cool optimize invoke during 2014/09/14----2014/09/24 or
  just longer for a while.
+ expected first release version before 2014/09/31.
+ regular maintain and version upgrade after the chinese National Day. 

## Parse module 
parse module should get useful information and preprocess the modules during transformFunction.
```javascript
module.exports = {
    /**
     * @description
     * To get proper module name, judge if the name is absent
     * @param {string} fileContents
     * the original file content to analyze to get module name
     * @returns {string} the module name from file contents, empty when undeclared
     */
	getModuleName: function(fileContents) {
        return '';
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} fileContents
     * the original file content to set explicit module name
     * @param {string} name
     * the proper name the module should be
     * @returns {string}  resolved file contents with module name, and ready for concat
     */
    setModuleName: function(fileContents, name) {
        return fileContents;
    },

    /**
     * @description
     * To get proper module dependencies name.
     * @param {string} fileContents
     * the original file content to analyze to get module dependencies name
     * @returns {array}
     * the module dependencies name from file contents, empty when undeclared
     */
	getModuleDependencies: function(fileContents) {
        return ;
    },

    /**
     * @description
     * To push proper module dependencies name.
     * @param {string} fileContents
     * the original file content to analyze to get module dependencies name
     * @param {array} modules
     * the module dependency to add, normally used for recursive.
     * @returns {array}
     * the module dependencies name from file contents, empty when undeclared
     */
    pushModuleDependencies: function(fileContents, modules) {
        return ;
    }
};
```