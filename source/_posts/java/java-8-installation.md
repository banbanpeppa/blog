---
layout:     post
title:      Linux系统安装JDK8
author:     "banban"
header-img: "/images/java/java-bg.jpg"
catalog: true
tags:
    - Java
---

# 源安装
## Ubuntu 16.04
使用`ppa`/源方式安装

添加`ppa`
```
sudo add-apt-repository ppa:webupd8team/java && sudo apt-get update
```

安装`oracle-java-installer`
```
sudo update-java-alternatives -s java-8-oracle
```

切换到`jdk8`
```
sudo update-java-alternatives -s java-8-oracle
```

测试`jdk`是是否安装成功
```
java -version && echo "-------------------" &&javac -version
```

## CentOS 7

Centos系统貌似并不提供`Oracle JDK`的安装办法，因此这里只安装`open-jdk`

检查一下系统有没有自带`open-jdk`

```
rpm -qa |grep java && \
echo "-------------------" && \
rpm -qa |grep jdk && \
echo "-------------------" && \
rpm -qa |grep gcj
```
没有信息表示没有安装

如果安装了可以使用`rpm -qa | grep java | xargs rpm -e --nodeps`批量卸载所有带有Java的文件

检索包含java的列表
```
yum list java*
```

检索1.8的列表
```
yum list java-1.8*   
```

安装1.8.0的所有文件
```
yum install java-1.8.0-openjdk* -y
```

使用命令检查是否安装成功
```
java -version
```

# 压缩包安装

## 下载jdk

[官网下载](https://www.oracle.com/technetwork/java/javase/downloads/index.html)`jdk8`的`tar.gz`包

##  解压
创建目录
```
sudo mkdir -p /usr/lib/jvm && cd /usr/lib/jvm
```

解压`jdk`到目录
```
sudo tar -zxvf jdk-xxxx-linux-x64.gz -C /usr/lib/jvm
```

## 配置
设置环境变量
```
vim /etc/profile

export JAVA_HOME=/usr/lib/jvm/jdk1.xxx_xxx
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib 
export PATH=${JAVA_HOME}/bin:$PATH
```
生效环境变量
```
source /etc/profile
```

设置系统默认`jdk`版本
```
sudo update-alternatives --install /usr/bin/java  java  $JAVA_HOME/bin/java  300
sudo update-alternatives --install /usr/bin/javac javac $JAVA_HOME/bin/javac 300
sudo update-alternatives --install /usr/bin/jar   jar   $JAVA_HOME/bin/jar   300
sudo update-alternatives --install /usr/bin/javah javah $JAVA_HOME/bin/javah 300
sudo update-alternatives --install /usr/bin/javap javap $JAVA_HOME/bin/javap 300
```

然后执行
```
sudo update-alternatives --config java
```

选择自己安装的版本
```
There are 3 programs which provide 'java'.

  Selection    Command
-----------------------------------------------
*  1           java-1.8.0-openjdk.x86_64 (/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.191.b12-0.el7_5.x86_64/jre/bin/java)
   2           java-1.7.0-openjdk.x86_64 (/usr/lib/jvm/java-1.7.0-openjdk-1.7.0.191-2.6.15.4.el7_5.x86_64/jre/bin/java)
 + 3           /usr/lib/jvm/jdk1.8.0_191/bin/java


Enter to keep the current selection[+], or type selection number:3 
```

测试`jdk`
```
java -version
```