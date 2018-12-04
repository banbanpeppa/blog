---
layout:     post
title:      CentOS 配置国内源
date:       2018-12-03 23:28:00
author:     "banban"
header-img: "/images/blog-common-bg.jpg"
catalog: true
tags:
    - Linux
    - 软件安装
---

# CentOS 配置国内源
阿里云Linux安装镜像源地址：http://mirrors.aliyun.com/

## CentOS系统更换软件安装源
### 第一步
备份你的原镜像文件，以免出错后可以恢复。
```
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```
### 第二步
下载新的CentOS-Base.repo 到/etc/yum.repos.d/
CentOS 5
```
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-5.repo
```
CentOS 6
```
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-6.repo
```
CentOS 7
```
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```
### 第三步
运行yum makecache生成缓存
```
yum makecache
```

当然，除了网易之外，国内还有其他不错的yum源，比如中科大和搜狐的等，大家可以根据自己需求下载

中科大的Linux安装镜像源：http://centos.ustc.edu.cn/
搜狐的Linux安装镜像源：http://mirrors.sohu.com/
北京首都在线科技：http://mirrors.yun-idc.com/