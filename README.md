gulp-requirejs
==============
![Build Status](https://img.shields.io/travis/bornkiller/gulp-requirejs/master.svg?style=flat)
![Coverage Report](http://img.shields.io/coveralls/bornkiller/gulp-requirejs.svg?style=flat)
![Package Dependency](https://david-dm.org/bornkiller/gulp-requirejs.svg?style=flat)
![Package DevDependency](https://david-dm.org/bornkiller/gulp-requirejs/dev-status.svg?style=flat)

Custom migration to gulp-requirejs, inspired by `grunt-contrib-requirejs`. 

# Warning
+ The project still in early state of development and far away from production environment.
  welcome any pull request.
+ Expected initial production version before 2014/09/31.
+ Regular maintain and version upgrade after the chinese National Day. 

# Instruction
+ All defined modules should in one particular directory like `./modules` (plugins or any other requirejs
  specific modules included), any other libs with global variable outside the directory just import their
  contents, without any processing.
+ When `opts.path` undeclared, all module name(auto added) and module dependent name should be relative 
  path **without dot, oblique at the beginning or extname at the end**. 
+ When `opts.path` declared, module name would be `path config` value, not original relative path. 
+ Only optimize `define` module, non-support with `require`, which means error throw.

# Feature
+ Support single requirejs file optimize. (Finished, maybe some bug not coveraged by UT)
+ Support multi requirejs file optimize. (Finished, maybe some bug not coverage by UT)
+ Support specific config options `path`. (Finished, maybe some bug not coverage by UT
  the path maps modules in the specific directory, or others outside the directory)
+ Files outside the directory will import. Third-party libs like `jquery` would import into the optimized
  file without processing.(Finished, maybe some bug not coverage by UT)
+ Partial plugin support, when you have dependency like `define['html!template/main'],function(template){})`,
  error event doesn't emit anymore since v0.8.5, and optional import the plugin contents by `opts.plugin`. 
  any way, tough stuff(Finished).
+ Support recursive moduleDependency optimize, but the depth limited to 2. The dependencies of direct 
  dependencies will be import, as belows.(Finished)

# options
Config options below provided now.
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
    module: 'optimize-info',
    // whether import plugin contents or not
    plugin: false, 
    // whether import contents recursively
    recursive: false
}
```

# Progress
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

+ Support multiple file optimize with `define` style, just execute `gulp example-multi`
  to see the effect. You will get `dist/optimize-info.js`, `dist/optimize-sub.js`.

+ Support path config file optimize in the specific directory with `define` style, just 
  execute `gulp example-path` to see the effect. You will get `dist/optimize-path.js`.

+ Support path config file optimize outside the specific directory, just execute 
  `gulp example-path` to see the effect. You will get `dist/optimize-outside.js`.

+ Support file optimize with dependency on plugins, just execute `gulp example-plugin` 
  to see the effect. You will get `dist/optimize-plugin.js`.

+ Support file optimize recursively, just execute `gulp example-recursive` to see the
  effect. You will get `dist/optimize-plugin.js`.

For example:
lang.js
```javascript
define([],function(){});
```
logger.js
```javascript
define(['lang'],function(){});
```
optimize-info.js
```javascript
define(['logger'],function(logger){});
```
structure will get contents below after optimize
```javascript
define('lang',[],function (){});
define('logger',['lang'],function (){});
define('optimize-info',['logger'],function (logger){});
```