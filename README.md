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

# Instruction
+ All defined modules should in one particular directory like `./modules`, any other modules or libs
  outside the directory will just import their contents, without any processing.
+ When `opts.path` undeclared, all module name(auto added) and module dependent name should be relative 
  path **without dot, oblique at the beginning or extname at the end**. 
+ When `opts.path` declared, module name would be `path config` value, not original relative path. 
+ Only optimize `define` module, non-support with `require`, which means error throw.
+ Non-support with requirejs plugin, which means error throw.

# Feature
+ Support single requirejs file optimize. (Finished, maybe some bug not coveraged by UT)
+ Support multi requirejs file optimize. (Finished, maybe some bug not coverage by UT)
+ Support specific config options `path`. (Half-Finished, maybe some bug not coverage by UT
  the path maps modules in the specific directory, or others outside the directory)
+ Files not in this directory will import. Third-party `requirejs` specific module or libs like 
  `jquery` would import into the optimized file without processing.(Finished, maybe some bug 
  not coverage by UT)

## options
Only three config options provided now.
```javascript
{
    // the baseUrl to search modules, relative to `gulpfile.js`
    baseUrl: './test/fixtures',
    // the mapping about specific module, dependent on `html` means 
    // `subFixtures/html.js` file will be imported.
    path: {
       'html': 'subFixtures/html',
       'jquery': '../mockLibs/jquery',
       'client': '../mockLibs/client'
    },
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

## Path config file optimize.
+ Till now, it just support path config file optimize in the specific directory with `define` style, just 
  execute `gulp example-path` to see the effect. You will get `dist/optimize-path.js`.

+ Till now, it just support path config file optimize outside the specific directory, just execute \
  `gulp example-path` to see the effect. You will get `dist/optimize-outside.js`.
