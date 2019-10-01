---
layout:     post
title:      MySQL杂记
date:       2019-08-14 14:23:00
author:     "banban"
header-img: "/images/linux/mysql_innodb_myisam.png"
catalog: true
tags:
    - Linux
---

在日常的应用开发中，mysql可以说是很大部分应用开发者的首选，大家都看重他强大的功能，例如事务、快速检索的能力等。

例 1：列出所有数据库
```
mysql -h host_name -P3306 -u user_name -p'password' -se "show databases;"
```
例 2：列出 database 下的所有表
```
mysql -h host_name -P3306 -u user_name -p'password' -D database -se "show tables;"
```