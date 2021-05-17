---
layout:     post
title:      AngularJS实现input autofocus属性
author:     "banban"
header-img: "/images/angularjs/angularjs_bg.png"
catalog: true
tags:
    - AngularJS
---


# AngularJS实现input focus聚焦

AngularJS通过指令的新属性来扩展HTML，其内置了许多指令来为应用添加功能，最常见的指令如`ng-app`、`ng-model`、`ng-bind`等等，同时AngularJS还提供了用户自定义指令功能。

**通过derective实现自定义focus聚焦**

为了能够让input标签具有自动获取焦点的能力，可以通过自定义一个指令来实现。具体的实现如下

```js
var app = angular.module('plunker', []);
var MyCtrl = function ($scope, $timeout) {
};

app.directive('customFocus', function($timeout) {
  return {
    scope: { trigger: '=customFocus' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
            scope.trigger = false;
          });
        }
      });
    }
  };
});
```

之后在html的input标签中可以这么使用
```html
<html ng-app="plunker">
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.0.4/angular.js"></script>
    <script src="example.js"></script>
    <link href="https://netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/css/bootstrap-combined.min.css" rel="stylesheet">
  </head>
  <body>

<div ng-controller="MyCtrl">
    <button class="btn"  ng-click="showForm=true;focusInput=true">show form and focus input</button>
    <div ng-show="showForm">
      <input type="text" custom-focus="focusInput">
      <button class="btn" ng-click="showForm=false">hide form</button>
    </div>
</div>
  </body>
</html>
```
[【示例】](https://codepen.io/marco27384/pen/GqgZXo)
