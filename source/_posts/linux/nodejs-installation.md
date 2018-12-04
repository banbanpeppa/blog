---
layout:     post
title:      Linux 下 Nodejs 安装
date:       2018-12-03 23:28:00
author:     "banban"
header-img: "/images/blog-common-bg.jpg"
catalog: true
tags:
    - Linux
    - 软件安装
---

# Nodejs安装

安装`nodejs`的方法有很多，这边介绍两种，一种是编译安装，另一种是源安装

## 二进制文件安装

打开 [Node.js](https://nodejs.org/en/download/) - 下载 `version 8.11.x` or greater，8.x版本可以通过链接：https://nodejs.org/dist/ 查询，然后下载对应版本的`tar.gz`包, 其余版本系类似

```
wget https://nodejs.org/dist/v8.11.0/node-v8.11.0-linux-x64.tar.gz
```
```
tar zxvf node-v8.11.0-linux-x64.tar.gz && cd node-v8.11.0-linux-x64/bin/ && ls -a

.  ..  node  npm  npx
```

这个时候会看到里面包含了三个二进制文件，将其中`node`、`npm`两个二进制文件复制到`/usr/local/bin`中或者`/usr/bin`中，一般放置在`/usr/bin/`中即可

```
cp node npm /usr/bin

node -v
v8.12.0

npm -v 
5.6.0
```

如果`npm`的版本低于`5.6.0`，升级版本
```
npm install npm@6.4.1 -g
```

如果出现了一些类似于如下错误
```
bash: /usr/local/bin/npm: No such file or directory
```
不能将二进制文件放在/usr/local/bin下面，而是放置在`/usr/bin`下。

如果出现如下错误
```
# npm -v

module.js:549
    throw err;
    ^

Error: Cannot find module '../lib/utils/unsupported.js'
    at Function.Module._resolveFilename (module.js:547:15)
    at Function.Module._load (module.js:474:25)
    at Module.require (module.js:596:17)
    at require (internal/module.js:11:18)
    at /usr/bin/npm:19:21
    at Object.<anonymous> (/usr/bin/npm:92:3)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
```
删除关于npm的依赖，一般是在`/usr/lib/node_modules/`下的`npm`
```
rm -rf /usr/lib/node_modules/npm
```
然后进入到之前安装nodejs的解压目录中
```
cd node-v8.11.0-linux-x64/bin/
```
使用二进制文件更新安装npm
```
./npm install -g npm@6.4.1
```
安装完成之后执行
```
npm -v

6.4.1
```

## 源安装
1\. Ubuntu 系统
在`Ubuntu16.04`环境下，执行如下命令进行源安装
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

如果安装完成执行命令
```
npm -v
bash: /usr/local/bin/npm: No such file or directory
```
将`npm`真实的安装位置添加到环境变量中
```
export PATH=/usr/bin:$PATH
```

2\. CentOS
通过EPEL源安装
```
sudo yum install -y epel-release && sudo yum install nodejs npm -y
```
## 设置源
设置国内源
```
npm config set registry http://registry.npm.taobao.org/

npm get registry
> http://registry.npm.taobao.org/
```
设置回默认源
```
npm config set registry https://registry.npmjs.org/
```