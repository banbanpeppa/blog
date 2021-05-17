---
layout:     post
title:      AngularJS使用Echarts
author:     "banban"
header-img: "/images/angularjs/angularjs_bg.png"
catalog: true
tags:
    - AngularJS
---

🤪

Echarts提供了非常强大的可视化功能，在平时的开发过程中难免用到echarts来助力数据展示。

那么在Angularjs中该如何使用echarts呢？下面撸一个例子方便后面参考。

## 指令&echarts

AngularJS中的指令是一种特有的处理DOM节点的方式，它可以操作以及渲染可重用的UI组件。例如想要用AngularJS处理echarts的一个柱状图📊，则可以通过下面的方式操作
```js
angular.module('demo')
    .directive('myBarChart', function($window) { //定义柱状图指令
        return {
            restrict: 'EA', // 以属性或者tag的形式调用指令
            link: function($scope, element, attrs) {  //attrs 是DOM元素的属性集合
                var myBarChart = echarts.init(element[0]); // element是一个jqlite对象，如果JQuery再AngularJS之前引入，则是一个Jquery对象，可以使用Jquery所有的方法
                $scope.$watch(attrs.eData, function(newVal, oldVal, scope) {//监听属性e-data的值，当数据发生改变时执行作为第二个参数的函数
                    var xData = [],
                        sData = [],
                        data = newVal,
                        totalCount = 0;
                    angular.forEach(data, function(val) {
                        xData.push(val.name);
                        sData.push(val.value);
                        totalCount += val.value;
                    });
                    var option = {
                        title: {
                            text: '用户访问来源统计',
                            subtext: '总计值:' + totalCount,
                            x: 'center',
                        },
                        color: ['#333642'],
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: [{
                            type: 'category',
                            data: xData,
                            axisTick: {
                            alignWithLabel: true
                            }
                        }],
                        yAxis: [{
                            type: 'value'
                        }],
                        series: [{
                            name: '直接访问',
                            type: 'bar',
                            barWidth: '60%',
                            data: sData
                        }]
                    };
                    myBarChart.setOption(option);
                }, true);
                $window.onresize = function() {
                    myBarChart.resize();
                }
            }
        }
    });
```

通过指令处理好了组件之后，便可以在之后的开发中使用组件。

## 使用echarts指令

**JavaScript**

```js
var app = angular.module("demo", []); //定义一个模块
angular.module("demo").controller("myCtrl", function($scope, $http, $interval) {
  //定义控制器
  $interval(function() {
    //调用$interval服务执行循环任务，3秒自动更新一次数据
    $http
      .get("/demo_get") //调用$http服务获取数据
      .success(function(data) {
        if (data.status == "0") {
          $scope.data = data.data; //将数据放在model中
        }
      })
      .error(function() {
        $scope.data[0].value = Math.floor(Math.random() * 2000); //模拟数据改变测试
      });
  }, 5000);
  //假设获取到的数据如下：
  var fakeData = {
    status: 0,
    data: [
      {
        value: 335,
        name: "直接访问"
      },
      {
        value: 310,
        name: "邮件营销"
      },
      {
        value: 234,
        name: "微信跳转"
      },
      {
        value: 135,
        name: "视频广告"
      },
      {
        value: 748,
        name: "搜索引擎"
      }
    ]
  };
  $scope.data = fakeData.data;
});
```

**HTML**

```html
<div ng-app="demo" ng-controller="myCtrl" id="demo">
  <div style="height:320px;" my-bar-chart e-data="data"></div>
</div>
```

整体效果可以参考：https://codepen.io/zhilingsomnus/pen/mdyjqKX?editors=1010