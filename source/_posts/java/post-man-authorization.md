---
layout:     post
title:      PostMan自动设置OAuth2请求头Auhtorization
date:       2019-04-28 10:00:00
author:     "banban"
header-img: "/images/java/postman.png"
catalog: true
tags:
    - Java
---

在开发java应用过程中，难免遇到资源请求的测试过程，一般开发过程中会借助类似PostMan或者Insomnia的工具。在使用PostMan的过程中，当需要结合oauth2请求认证的token时，如果不设置变量，每次都需要手动去更换每一个请求的Token，操作非常繁琐。

为了自动化地设置这个token，我们需要使用postman的`Tests`功能。Postman的`Tests`功能支持使用JS进行一些变量操作。我们可以在授权接口的请求中填入如下的Tests脚本：
```
var token = JSON.parse(responseBody).value;
postman.clearGlobalVariable("token");
postman.setGlobalVariable("token", token);
```
具体内容如下图所示

![image](/images/java/postman_test.jpg)

之后其他需要用到认证Token的请求都可以通过如下设置方式自动设置好Token

![image](/images/java/postman_req.png)