---
layout:     post
title:      Linux系统安装Maven3
author:     "banban"
header-img: "/images/java/maven-bg.jpg"
catalog: true
tags:
    - Java
---

## 下载maven
创建目录
```
mkdir -p /usr/share/maven/ && cd /usr/share/maven
```
下载maven3.6
```
wget https://www-eu.apache.org/dist/maven/maven-3/3.6.0/binaries/apache-maven-3.6.0-bin.tar.gz
```
解压
```
tar -zxvf apache-maven-3.6.0-bin.tar.gz &&  rm apache-maven-3.6.0-bin.tar.gz
```

## 配置环境变量
```
vim /etc/profile


export M2_HOME=/usr/share/maven/apache-maven-3.6.0
export PATH=$PATH:$M2_HOME/bin
```
使环境变量生效
```
source /etc/profile
```
测试是否安装成功
```
mvn --version

Apache Maven 3.6.0 (97c98ec64a1fdfee7767ce5ffb20918da4f719f3; 2018-10-25T02:41:47+08:00)
Maven home: /usr/share/maven/apache-maven-3.6.0
Java version: 1.8.0_191, vendor: Oracle Corporation, runtime: /usr/lib/jvm/jdk1.8.0_191/jre
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "3.10.0-862.11.6.el7.x86_64", arch: "amd64", family: "unix"
```