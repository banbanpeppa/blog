---
layout:     post
title:      rsync - 文件同步与传输神器
date:       2019-09-18 14:44:00
author:     "banban"
header-img: "/images/linux/linux_bg_2.png"
catalog: true
tags:
    - Linux
---

# 文件同步神器 —— Rsync

![image](/images/linux/rsynclogo.jpg)

Rsync作为文件同步工具，其在许多场景下都提供了便捷。为了实现文件传输，用户会使用`scp`工具，🤠`scp`工具是基于ssh协议来设计的，其在安全性上面优势明显，但是如果存在如下场景，`scp`无疑是一种比较浪费资源并且比较低效的做法：

当传输的文件经常面临修改或者发生变更，例如代码，使用scp会全量进行覆盖，每一次都会进行所有文件的复制，并且覆盖。

这个时候通常会采用`rsync`的方式来同步文件，实现增量式传输文件，这样能够极大提升文件的传输效率。

## scp vs rsync

1\. 对比默认参数下, 两种方式消耗的系统资源情况
- 在都是空目录的情况下同步信息，scp和rsync的执行效率相当，在一个量级，但是当已经同步过一次之后，在后续同步内容的过程中会看到同步的效率rsync快了非常多，这是因为scp是复制，而rsync是覆盖。

2\. 在服务器端存在对应服务的条件下
- scp是加密的
- rsync本身是不加密的，除非配置了使用ssh通道或者vpn通道，为此ysync的传输效率会比较高。

3\. scp和rsync的具体适用场景
- 如果是频繁更新的文件并且是小文件，则建议使用rsync
- 如果是很少更新的文件，建议使用scp，简单方便快捷，同时还是加密传输

## rsync安装

rsync 命令在大部分的Unix或者Linux系统上面都预装了，如果没有安装，则可以通过下面的命令来安装。

在CentOS & RHEL系统上执行
```sh
yum install rsync -y
```
在Debian系操作系统中(Ubuntu & Linux Mint)执行
```sh
apt install rsync -y
```

## rsync命令

![image](/images/linux/rsync-command-example-linux.jpg)

rsync的命令参数主要包括如下
```js
rsync  
    -a  归档模式，表示以递归方式传输文件，并保持所有属性
    -r  对于目录以递归模式处理，主要针对目录，传输的是目录必须加-r
    -v  打印一些信息出来，比如速率，文件数量等。
    -l  保留软连链
    -L  向对待常规文件一样处理软链接，如果是src(源机)中有软链接文件，刚加上该选项后会把软连接指向的目标文件拷贝到dst（目标机）
    -p  保持文件权限
    -o  保持文件属主信息
    -g  保持文件属组信息
    -D  保持 设备文件信息
    -t  保持 文件时间信息
    --delete 删除那些dst中src没有的文件
    --exclude=PATTERN指定排除不需要传输的文件，等号后面跟文件名，可以是万用字符模式（如*.txt）
        PATTERN路径是相对弄要同步的路径如(rsync -avPz --exclude=zabbix /opt/sh 10.8.64.99::backup/tmp/ #排除的是/opt/sh/zabbix)
    --progress或-P 在同步的过程中可以看到同步的过程状态，比如统计要同步的文件数量，同步的文件传输速度等等。。。
    --bwlimit=10 （限制传输速度）
    -u  加上这个选项后将会把DST中比SRC还新的文件排除掉，不会覆盖
    -z  压缩   传输的过程中会压缩，我们并不会感知。 文件到了目标机器上我们看到的是一样的。
    （工作中常用的几个 -a  -v  --delete  --exclude）
```

使用rsync传输文件有两种模式，一种是通过`ssh`隧道来传输，另一种是通过连接服务端的`rsync daemon`来传输。

一下举一些例子来说明两种传输模式。
```
rsync同步ssh隧道方式：#后面的目录是目标地址
    例1：rsync -avPz 192.168.183.109:/tmp/1.txt /tmp/   拉文件：远程到本机
    例2：rsync -avPz /tmp/1.txt  192.168.183.109:/tmp/   推文件：本机到远程
    例3：rsync -avPz -e "ssh -p 10022" /tmp/1.txt  192.168.183.109:/tmp/   推文件：本机到远程，端口不是22的情况
rsync同步daemon方式
    例1：不需要密码   学ssh免密码登陆
    rsync -auvPz --bwlimit=10 （限制传输速度） tmp.txt test@<ip>::test --password-file=~/.rsync.password
    例2：查询rsyncd可用模块   (list参数，yes会显示，no不会显示)
    rsync -list --port 8873  192.168.186.118::
```

## rsync daemon

rsync通过daemon的方式启动一个服务端，让客户端连接服务端完成文件传输。daemon的可以分不同模块来处理不同的rsync请求。

为了能够启动一个服务端rsync daemon，需要按照如下例子配置

创建`/etc/rsyncd.conf`配置文件，内容如下
```conf
port=8873
log file=/var/log/rsync.log
pid file=/var/run/rsyncd.pid
address=192.168.0.11 # 本机IP地址
[mkdocs]
path=/home/banban/mkdocs
use chroot=true
max connections=4
read only=no
list=true
uid=banban
gid=banban
auth users=chenzhiling
secrets file=/etc/rsyncd.passwd
# pre-xfer exec=/home/banban/deploy.sh
post-xfer exec=/home/banban/deploy.sh
hosts allow=192.168.0.1/32
```
解释一下每一个参数的含义
```conf
port：说明启动rsyncd服务的端口号，默认是873。
log file：日志文件位置。
pid file：服务文件。
address：启动rsyncd服务的本机IP地址
[]：rsync的模块
path：rsync需要同步的目录位置，这里指明为/home/banban/mkdocs
use chroot true|false：是否需要root权限来同步
max connections：指定最大的连接数。
list：当用户查询该服务器上的可用模块时，是否列出这个模块。
uid/gid：banban
auth users：banban
secrets file：指定密码文件，该参数连同上面的参数如果不指定，则不使用密码验证。注意该密码文件的权限一定要是600。
hosts allow：表示被允许连接该模块的主机，其中前面两个IP是作业给出的另外两台机器的IP，最后一个是通过在办公网下使用dig -x 反解得到的gitlab的ip
```
> 具体关于`rsyncd.conf`的配置可以参考: https://download.samba.org/pub/rsync/rsyncd.conf.html

创建密码文件`/etc/rsyncd.passwd`
```bash
echo "chenzhiling:xxxxx" > /etc/rsyncd.passwd
chmod 600 /etc/rsyncd.passwd
```
> 注意：这个文件的权限一定要设置为600，文件内容格式[rsync-user:password]

启动服务
```bash
rsync --daemon --config=/etc/rsyncd.conf
```
为了方便rsync的服务管理，可以使用下面这个脚本
```bash
#!/bin/bash 
  
# this script for start|stop rsync daemon service 
  
status1=$(ps -ef | egrep "rsync --daemon" | grep -v 'grep') 
pidfile="/var/run/rsyncd.pid" 
start_rsync="rsync --daemon --config=/etc/rsyncd.conf" 
  
function rsyncstart() { 
    if [ "${status1}X" == "X" ];then 
        rm -f $pidfile       
        ${start_rsync}   
        status2=$(ps -ef | egrep "rsync --daemon.*rsyncd.conf" | grep -v 'grep') 
        if [  "${status2}X" != "X"  ];then 
            echo "rsync service start.......OK"   
        fi 
    else 
        echo "rsync service is running !"    
    fi 
} 
  
function rsyncstop() { 
    if [ "${status1}X" != "X" ];then 
        kill -9 $(cat $pidfile) 
        status2=$(ps -ef | egrep "rsync --daemon" | grep -v 'grep') 
        if [ "${statusw2}X" == "X" ];then 
              
            echo "rsync service stop.......OK" 
        fi 
    else 
        echo "rsync service is not running !"    
    fi 
} 
  
  
function rsyncstatus() { 
    if [ "${status1}X" != "X" ];then 
        echo "rsync service is running !"   
    else 
         echo "rsync service is not running !" 
    fi 
  
} 
  
function rsyncrestart() { 
  
    if [ "${status1}X" == "X" ];then 
        echo "rsync service is not running..." 
        rsyncstart 
    else 
        rsyncstop 
        rsyncstart
    fi       
}  
  
case $1 in 
    "start") 
        rsyncstart 
        ;; 

    "stop") 
        rsyncstop 
        ;; 

    "status") 
        rsyncstatus 
        ;; 

    "restart") 
        rsyncrestart 
        ;; 

    *)
        echo 
            echo  "Usage: `basename $0` start|stop|restart|status" 
        echo 
esac
```

启动了服务之后，便可以通过客户端传输文件
```bash
rsync -avz --port 8873 ./ chenzhiling@<ip>::mkdocs/
```