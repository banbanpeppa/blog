---
layout:     post
title:      Linux 安装golang环境
date:       2018-12-03 23:28:00
author:     "banban"
header-img: "/images/blog-common-bg.jpg"
catalog: true
tags:
    - Linux
    - 软件安装
---

# 安装golang环境

## 下载golang
```
wget https://dl.google.com/go/go1.11.2.linux-amd64.tar.gz
```
## 解压
```
tar -C /usr/local -xzf go1.11.2.linux-amd64.tar.gz
```
## 配置环境变量
```
cp /etc/profile /etc/profile.bak
echo "export GOROOT=/usr/local/go" >> /etc/profile
echo "export PATH=\$PATH:\$GOROOT/bin" >> /etc/profile
echo "export GOPATH=/opt/gopath" >> /etc/profile
echo "export PATH=\$PATH:\$GOPATH/bin" >> /etc/profile
```
## 生效环境变量
```
source  /etc/profile
```
## 验证安装
```
go version
```