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

## CentOS7
1、使用 root 权限登录 Centos。确保 yum 包更新到最新。
```
$ sudo yum update
```
2、卸载旧版本(如果安装过旧版本的话)
```
$ sudo yum remove docker  docker-common docker-selinux docker-engine
```
3、安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的
```
$ sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```
4、设置yum源
```
$ sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```
5、可以查看所有仓库中所有docker版本，并选择特定版本安装
```
$ yum list docker-ce --showduplicates | sort -r

http://ftp.cuhk.edu.hk/pub/linux/fedora-epel/7/x86_64/repodata/repomd.xml: [Errno -1] repomd.xml does not match metalink for epel
Trying other mirror.
http://mirror.horizon.vn/epel/7/x86_64/repodata/repomd.xml: [Errno -1] repomd.xml does not match metalink for epel
Trying other mirror.
 * updates: mirrors.aliyun.com
Loading mirror speeds from cached hostfile
Loaded plugins: fastestmirror, langpacks
 * extras: mirrors.aliyun.com
 * epel: ftp.cuhk.edu.hk
docker-ce.x86_64            3:18.09.0-3.el7                     docker-ce-stable
docker-ce.x86_64            18.06.1.ce-3.el7                    docker-ce-stable
docker-ce.x86_64            18.06.0.ce-3.el7                    docker-ce-stable
docker-ce.x86_64            18.03.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            18.03.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.12.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.12.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.09.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.09.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.06.2.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.06.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.06.0.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.03.3.ce-1.el7                    docker-ce-stable
docker-ce.x86_64            17.03.2.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.03.1.ce-1.el7.centos             docker-ce-stable
docker-ce.x86_64            17.03.0.ce-1.el7.centos             docker-ce-stable
 * base: mirrors.aliyun.com
Available Packages
```
6、安装docker
```
$ sudo yum install docker-ce  # 由于repo中默认只开启stable仓库
$ sudo yum install <FQPN>     # 例如：sudo yum install docker-ce-17.12.0.ce
```
7、启动并加入开机启动
```
$ sudo systemctl enable docker
$ sudo systemctl start docker
```
8、验证安装是否成功(有client和service两部分表示docker安装启动都成功了)
```
$ docker version
```

### 错误
如果遇到docker服务启动不起来
```
systemctl start docker

Job for docker.service failed because the control process exited with error code. See "systemctl status docker.service" and "journalctl -xe" for details.
```
则查看错误日志
```
journalctl -xe

Dec 04 10:31:33 blockchain dockerd[100248]: time="2018-12-04T10:31:33.152263785+08:00" level=info msg="pickfirstBalancer: HandleSubConnStateChange: 0xc4201758d0, CONNECTING"
Dec 04 10:31:33 blockchain dockerd[100248]: time="2018-12-04T10:31:33.155043419+08:00" level=info msg="pickfirstBalancer: HandleSubConnStateChange: 0xc4201758d0, READY" modu
Dec 04 10:31:33 blockchain kernel: overlayfs: failed to resolve '/var/lib/docker/overlay2/multiple-lowerdir-check856558933/lower2:/var/lib/docker/overlay2/multiple-lowerdir-
Dec 04 10:31:33 blockchain dockerd[100248]: time="2018-12-04T10:31:33.155594196+08:00" level=info msg="pickfirstBalancer: HandleSubConnStateChange: 0xc42016ac00, READY" modu
Dec 04 10:31:33 blockchain dockerd[100248]: time="2018-12-04T10:31:33.156174381+08:00" level=error msg="[graphdriver] prior storage driver overlay2 failed: driver not suppor
Dec 04 10:31:33 blockchain dockerd[100248]: Error starting daemon: error initializing graphdriver: driver not supported
Dec 04 10:31:33 blockchain systemd[1]: docker.service: main process exited, code=exited, status=1/FAILURE
Dec 04 10:31:33 blockchain systemd[1]: Failed to start Docker Application Container Engine.
-- Subject: Unit docker.service has failed
-- Defined-By: systemd
-- Support: http://lists.freedesktop.org/mailman/listinfo/systemd-devel
-- 
-- Unit docker.service has failed.
...
```
会看到是因为错误`Error starting daemon: error initializing graphdriver: driver not supported`

解决办法： 在 /etc/docker 目录下创建daemon.json文件，并且加入以下配置(可以先尝试重启)
```
mkdir /etc/docker && cd /etc/docker && vim daemon.json

{
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
```
重启服务
```
systemctl daemon-reload
systemctl start docker
```

### 修改源
配置国内源，在`/etc/docker/daemon.json`下配置
```
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
```
如果原来已经有内容，则可以类似如下添加配置
```
{
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
```
重启服务
```
systemctl daemon-reload
systemctl start docker
```
查看是否已经添加了镜像源
```
docker info 

...
Registry Mirrors:
 https://registry.docker-cn.com/
...
```

### 安装docker-compose
```
curl -L --fail https://github.com/docker/compose/releases/download/1.19.0/run.sh -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose && sudo cp /usr/local/bin/docker-compose /usr/bin
docker-compose --version
```