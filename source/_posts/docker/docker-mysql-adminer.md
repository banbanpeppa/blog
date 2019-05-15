---
layout:     post
title:      Docker 安装 Mysql + Adminer
subtitle:	"\"实现远程访问\""
date:       2019-01-24 22:00:00
author:     "banban"
header-img: "/images/docker/bg.png"
catalog: true
tags:
    - Docker
---

# Docker 安装 Mysql + Adminer

## 使用docker-compose
本教程时，使用mysql镜像最新版本为：8, 编辑 `mysql-docker-compose.yml`文件，
```
# Use root/example as user/password credentials
version: '3.1'

services:

  db:
    image: mysql:8
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: example

  adminer:
    image: adminer
    container_name: mysql-adminer
    restart: always
    ports:
      - 8080:8080
```
使用`docker-compse`启动数据库和`adminer`
```
docker-compose -f mysql-docker-compose.yml up -d
```
之后可以通过 http://localhost:8080 访问adminer操作数据库

## 使用docker run
使用docker run启动mysql服务，首先需要拉取镜像
```
docker pull mysql:8
docker pull adminer
```
之后需要准备`mysql`的配置文件，创建`conf`目录，挂载数据库容器中的`/etc/mysql/conf.d`目录。
```
mkdir ~/conf
touch ~/conf/my.cnf
vim my.cnf
```
配置内容如下
```
[mysqld]
user=mysql
character-set-server=utf8
default_authentication_plugin=mysql_native_password
[client]
default-character-set=utf8
[mysql]
default-character-set=utf8
```
这个配置使得能够远程访问数据库，用户可以通过navicat等工具远程连接数据库。注意：这边的配置也可以提供给`docker-compose`的方法使用，在`docker-compose`文件中配置挂载目录即可。

启动mysql服务
```
docker run -d -p 3306:3306 --restart=always \
--name mysql -v $HOME/conf:/etc/mysql/conf.d \
-e MYSQL_ROOT_PASSWORD=fabric mysql:8

docker run --link mysql:mysql --name adminer \
-p 8888:8080 -d --restart=always adminer
```