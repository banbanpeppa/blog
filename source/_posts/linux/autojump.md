---
layout:     post
title:      懒人神器autojump
subtitle:   Faster File Navigation with autojump
date:       2019-09-16 13:59:00
author:     "banban"
header-img: "/images/linux/linux_bg_2.png"
catalog: true
tags:
    - Linux
---

![image](/images/linux/autojump.jpg)

## What is autojump

`autojump`是一个类似于`cd`命令的工具，它可以快速定位到目录或者文件，其实现的基本原理是由于`autojump`维护了一个目录访问历史表，如果出现目录名同名的情况，`autojump`会根据不同目录的访问频率来设置对应的权重，权重高的优先进入。

开源地址：https://github.com/wting/autojump

## Installation

`autojump`的安装主要在Linux和Mac系统下面，目前在Windows下面还没有直接的支持。

### Debian/Ubuntu

安装
```bash
apt install -y autojump
```

在Debian系系统中，需要手动激活`autojump`，为了暂时激活 autojump 应用，即直到你关闭当前会话或打开一个新的会话之前让 autojump 均有效，你需要以常规用户身份运行下面的命令:
```bash
source /usr/share/autojump/autojump.sh on startup
```

为了使得 autojump 在 BASH shell 中永久有效，你需要运行下面的命令。
```bash
echo '. /usr/share/autojump/autojump.sh' >> ~/.bashrc
```
关于autojump的文档放在
```bash
cat /usr/share/doc/autojump/README.Debian
```

### CentOS

安装
```bash
yum install epel-release
yum install autojump
或
dnf install autojump
```

### 关于shell
对于特别的shell例如zsh或者fish，可以使用不同的autojump版本,在zsh下使用 `autojump-zsh` ，在fish下使用`autojump-fish`。

### MacOS
直接通过brew进行安装
```bash
brew install autojump
```
默认安装的位置是
```bash
/usr/local/Cellar/autojump/
```
不同版本都放在这个目录下面。

在安装过程中可能会询问一些配置的步骤，根据提示配置即可。

安装好之后，如果是使用默认的bash，执行
```bash
bash /usr/local/Cellar/autojump/22.5.3/share/autojump/autojump.bash
```

同时将下列配置添加到`~/.bash_profile`中
```bash
# Set autojump env
. /usr/local/Cellar/autojump/22.5.3/share/autojump/autojump.bash
```

如果是`oh-my-zsh`作为用户shell，则配置plugin，添加如下配置内容到`~/.zshrc`中
```bash
plugins=(... autojump)
```
其中省略号表示别的plugin。

## Usage

auto的使用很简单，通过-h可以看到其主要的功能
```bash
chenzhiling@banban:~ ➜ j -h 
usage: autojump [-h] [-a DIRECTORY] [-i [WEIGHT]] [-d [WEIGHT]] [--complete]
                [--purge] [-s] [-v]
                [DIRECTORY [DIRECTORY ...]]

Automatically jump to directory passed as an argument.

positional arguments:
  DIRECTORY             directory to jump to

optional arguments:
  -h, --help            show this help message and exit
  -a DIRECTORY, --add DIRECTORY
                        add path
  -i [WEIGHT], --increase [WEIGHT]
                        increase current directory weight
  -d [WEIGHT], --decrease [WEIGHT]
                        decrease current directory weight
  --complete            used for tab completion
  --purge               remove non-existent paths from database
  -s, --stat            show database entries and their key weights
  -v, --version         show version information

Please see autojump(1) man pages for full documentation.
```
`autojump`的别名是`j`，很简约
```bash
chenzhiling@banban:~ ➜ j -s
________________________________________

0:	 total key weight
0:	 stored directories
0.00:	 current directory weight

data:    /Users/chenzhiling/Library/autojump/autojump.txt
```
刚安装的时候，autojump没有记录任何信息，因此总权重为0。

在使用了一段时间`cd`命令之后，autojump自然而然会记录一些目录访问记录，如下
```bash
chenzhiling@banban:~ ➜ j -s

...
65.6:   /Users/chenzhiling/dev/nodejs-workspace
67.8:   /Users/chenzhiling/dev/nodejs-workspace/devteam/x-ui
67.8:   /Users/chenzhiling/dev/nodejs-workspace/devteam
81.2:   /Users/chenzhiling/dev/python-workspace/devteam/x-server
________________________________________

2806:    total weight
168:     number of entries
0.00:    current directory weight

data:    /Users/chenzhiling/Library/autojump/autojump.txt
```
这样权重最高的会优先被遍历，例如想要快速跳转到`x-server`这个目录下面
```bash
j x-server
```
便可以直接跳转到`/Users/chenzhiling/dev/python-workspace/devteam/x-server`这个目录下面，省去了很长的目录输入。

如果`autojump`还没有记录的那些目录你想要直接跳转，是不行的，至少需要使用`cd`进入到对应的目录一次，才有可能用`autojump`，否则会直接跳转到`.`。

Enjoy it！