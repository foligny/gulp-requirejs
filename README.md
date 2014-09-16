gulp-requirejs
==============
![Build Status](https://img.shields.io/travis/bornkiller/gulp-requirejs/master.svg?style=flat)
![Coverage Report](http://img.shields.io/coveralls/bornkiller/gulp-requirejs.svg?style=flat)
![Package Dependency](https://david-dm.org/bornkiller/gulp-requirejs.svg?style=flat)
![Package DevDependency](https://david-dm.org/bornkiller/gulp-requirejs/dev-status.svg?style=flat)

Custom migration to gulp-requirejs, inspired by `grunt-contrib-requirejs`. 

# Warning
+ The project still in early state of development and far away from production environment.
  welcome any pull request, I promise to lookup any modification, or just become collaborator through
  send me an email hjj491229492@hotmail.com.
+ Expected first release version before 2014/09/31.
+ Regular maintain and version upgrade after the chinese National Day. 

# Feature and Limitation
## Limitation Now
+ All defined file should in one particular directory like `./modules`.
+ Only optimize `define` module, non-support with `require`.
+ Non-support with specific config options like `path`, `shim`, `map`, all module name(auto added)
  and module dependent name should be relative path *without dot, oblique, or extname*. 
+ Non-support with requirejs plugin.

## Feature
+ Support single requirejs file optimize. (Finished, maybe some bug not coveraged by UT)
+ Support multi requirejs file optimize. (Finished, maybe some bug not coverage by UT)
+ Support specific config options, such as path, shim, map. (Developing)
+ Support requirejs plugin. (Pending)

## options
Only two config options provided now.
```javascript
{
    // the baseUrl to search modules, relative to `gulpfile.js`
    baseUrl: './test/fixtures',
    // the module name you want to optimize, string or array
    module: 'optimize-info'
}
```

# Progress
## Single file optimize.
+ Till now, it just support single file optimize with `define` style, just execute `gulp example-basic`
  or `gulp example-sub` to see the effect. javascript files in sub-directory of baseUrl accepted.

+ In the `example-basic`, you have three modules in the `baseUrl` directory as below:

lang.js
```javascript
define([],function(){});
```
logger.js
```javascript
define([],function(){});
```
optimize-info.js
```javascript
define(['lang','logger'],function(lang,logger){});
```

after `gulp example-basic`, you will get `dist/optimize-info.js`, whose contents as below:
```javascript
define('lang',[],function (){});
define('logger',[],function (){});
define('optimize-info',['lang','logger'],function (lang,logger){});
```

## Multiple file optimize.
+ Till now, it just support multiple file optimize with `define` style, just execute `gulp example-multi`
  to see the effect. You will get `dist/optimize-info.js`, `dist/optimize-sub.js`.