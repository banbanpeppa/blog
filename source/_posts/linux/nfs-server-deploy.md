---
layout:     post
title:      Linux安装NFS服务
date:       2019-03-25 14:23:00
author:     "banban"
header-img: "/images/blog-common-bg.jpg"
catalog: true
tags:
    - Linux
    - 软件安装
---

# Linux安装NFS服务

## NFS服务器
NFS（Network File System）即网络文件系统， 在NFS的应用中，本地NFS的客户端应用可以透明地读写位于远端NFS服务器上的文件，就像访问本地文件一样。nfs是通过挂载的方式来访问

## Ubuntu、Debian系统安装NFS
### 安装nfs服务器

```
apt-get install nfs-kernel-server
```

## CentOS安装NFS
```
yum -y install nfs-utils rpcbind
```

## 服务端配置
在NFS服务端上创建共享目录`/opt/share`并设置权限
```
mkdir -p /opt/share
chmod 666 /opt/share
```
### 设置/etc/exports配置文件

```
vim /etc/exports

/opt/share *(rw,no_root_squash,no_all_squash,sync)
```
添加这行配置，rw读写权限，sync同步，no_root_squash来访的root用户保持root帐号权限

客户端的指定方式:

- 指定ip地址的主机：192.168.1.100
```
/opt/share 192.168.1.100 (rw,no_root_squash,no_all_squash,sync)
```

- 指定子网中的所有：192.168.2.0/24
```
/opt/share 192.168.2.0/24(rw,no_root_squash,no_all_squash,sync)
```

- 所有主机：*
```
/opt/share *(rw,no_root_squash,no_all_squash,sync)
```

权限指定方式:

- rw读写

- ro只读

### 配置生效
```
exportfs -r
```

### 启动rpcbind、nfs服务
CentOS
```
service rpcbind start
service nfs start
```
Ubuntu、 Debian
```
service nfs-kernel-server restart
```
### 查看 RPC 服务的注册状况
```
# rpcinfo -p localhost
program vers proto   port  service
100000    4   tcp    111  portmapper
100000    3   tcp    111  portmapper
100000    2   tcp    111  portmapper
100000    4   udp    111  portmapper
100000    3   udp    111  portmapper
100000    2   udp    111  portmapper
100005    1   udp  49979  mountd
100005    1   tcp  58393  mountd
100005    2   udp  45516  mountd
100005    2   tcp  37792  mountd
100005    3   udp  32997  mountd
100005    3   tcp  39937  mountd
100003    2   tcp   2049  nfs
100003    3   tcp   2049  nfs
100003    4   tcp   2049  nfs
100227    2   tcp   2049  nfs_acl
100227    3   tcp   2049  nfs_acl
100003    2   udp   2049  nfs
100003    3   udp   2049  nfs
100003    4   udp   2049  nfs
100227    2   udp   2049  nfs_acl
100227    3   udp   2049  nfs_acl
100021    1   udp  51112  nlockmgr
100021    3   udp  51112  nlockmgr
100021    4   udp  51112  nlockmgr
100021    1   tcp  43271  nlockmgr
100021    3   tcp  43271  nlockmgr
100021    4   tcp  43271  nlockmgr
```
在你的 NFS 服务器设定妥当之后，我们可以在 server 端先自我测试一下是否可以联机
```
# showmount -e localhost
Export list for localhost:
/opt/share *
```
```
选项与参数：
-a ：显示目前主机与客户端的 NFS 联机分享的状态；
-e ：显示某部主机的 /etc/exports 所分享的目录数据。
```
## 客户端配置
创建挂载目录
```
mkdir -p /data/fabric
```
挂载目录到NFS服务器
```
mount -t nfs 125.216.243.88:/opt/share /data/fabric -o proto=tcp -o nolock
```

```
-t nfs                          #挂载类型
-o nolock                       #读写的时候不锁定 
-o tcp                          #tcp模式，
<nfs-ip>:/home/where/nfs        #服务器地址，
/mnt                            #挂载到本地mnt目录
```
查看挂载情况
```
# df -h

Filesystem                 Size  Used Avail Use% Mounted on
/dev/mapper/centos-root     50G   13G   38G  26% /
...
125.216.243.88:/opt/share   50G   11G   40G  21% /data/fabric
```