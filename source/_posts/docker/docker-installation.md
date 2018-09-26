---
layout:     post
title:      "Docker 安装"
subtitle:	"\"不同操作系统\""
date:       2018-09-25 13:00:00
author:     "banban"
header-img: "/images/docker/bg.png"
catalog: true
tags:
    - Docker
---

## Debian9

### 移除旧的docker相关软件
```
$ sudo apt-get remove docker docker-engine docker.io
```   
```      
$ sudo apt-get update
```
### 安装基本软件
```
$ sudo apt-get install -y \
     apt-transport-https \
     ca-certificates \
     curl \
     gnupg2 \
     software-properties-common
```
### 添加docker安装源
```
$ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
```
```
$ sudo apt-key fingerprint 0EBFCD88
```
```
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"
```
```
$ sudo apt-get update
```

### 安装
```
$ sudo apt-get install -y docker-ce
```

### 更改国内源
```
vim /etc/default/docker
```
更改内容
```
DOCKER_OPTS="--dns 114.114.114.114 --graph=/home/chenzhiling/docker --registry-mirror=https://docker.mirrors.ustc.edu.cn/"
```

```
$ sudo service docker restart
```

## Ubuntu
```
apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable"
apt-get update && apt-get install -y docker-ce=$(apt-cache madison docker-ce | grep 17.03 | head -1 | awk '{print $3}')
```

## Deepin
```
apt-get update
apt-get install -y docker.io
systemctl enable docker.service
```