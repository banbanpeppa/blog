---
layout:     post
title:      Linux命令 — grep
subtitle:   keep moving ...
date:       2019-08-15 16:23:00
author:     "banban"
header-img: "/images/linux/linux_bg_2.png"
catalog: true
tags:
    - Linux
---

在使用Linux的过程中，经常会遇到在大量文件中查找某一些文件是否包含了某些文件内容的情况。例如在一堆的日志文件里面把出现“memory”字眼的文件过滤出来。

我们知道用find命令可以使用一些正则表达式来寻找某一些文件，但是却不能够用来寻找文件内是否包含某一些内容。

grep可以帮我们实现这种效果。

## grep

grep的中文全称是“全面搜索正则表达式并把行打印出来”，它能使用正则表达式来搜索文本并且将匹配的行打出来。

## 常用参数

首先用grep直接搜索某个文件很简单
```
$ grep "import" setup.py
import io
import re
from setuptools import setup
```
这种输出是最快捷方便的

### -r & -R

如果想再一个目录下搜索所有的包含“import”内容的文件呢？可以使用-r或者-R，当然他们有一点点不一样

首先在一个独立的测试目录下面创建a、b、c、d文件，这写文件的内容分别如下
```
$ for file in {a..d}; do echo "$file:";cat $file; done
a:
import
b:
import test
c:
import test import
import
d:
IMPORT
import
```

现在分别对d文件创建一个硬链接和软链接
```
$ ln d e
$ ln -s d f
```
于是目录下的文件结构如下
```
$ ls -alk
total 20
drwxr-xr-x 2 chenzhiling01 root          60 8月  15 17:28 .
drwxr-xr-x 6 chenzhiling01 chenzhiling01 93 8月  15 17:15 ..
-rw-r--r-- 1 chenzhiling01 root           7 8月  15 16:55 a
-rw-r--r-- 1 chenzhiling01 root          12 8月  15 17:27 b
-rw-r--r-- 1 chenzhiling01 root          26 8月  15 17:28 c
-rw-r--r-- 2 chenzhiling01 root          14 8月  15 17:19 d
-rw-r--r-- 2 chenzhiling01 root          14 8月  15 17:19 e
lrwxrwxrwx 1 chenzhiling01 root           1 8月  15 16:57 f -> d
```
先来看
```
$ grep -r 'import' ./
./a:import
./b:import test
./d:import
./e:import
./c:import test import
./c:import
```
再使用-R
```
$ grep -R 'import' ./
./a:import
./b:import test
./d:import
./e:import
./f:import
./c:import test import
./c:import
```

会看到-R得到的结果会比-r多一个文件，这个文件就是f，这个文件是软链接到d文件的，也就是说-R会递归寻找，同时不会忽略掉软链接的文件。

### -h & -H

如果只想看看对应某一个文件内容出现的具体行，而不像要看到对应的文件名，则可以使用-h，而-H则是输出文件名
```
$ grep -r -h "import" ./
import
import test
import
import
import test import
import
```
```
$ grep -r -H "import" ./
./a:import
./b:import test
./d:import
./e:import
./c:import test import
./c:import
```
所以如果想值看到文件名，可以结合管道和cut
```
$ grep -r -H "import" ./ | cut -d: -f1
./a
./b
./d
./e
./c
./c
```

### egrep查找

在一些情况下可能会想找多个内容，则可以使用egrep
```
egrep -w -R 'word1|word2' ./
```

### 解决错误

在一些时候可能会出现权限问题或者文件不存在等问题，但是grep默认是不会处理这个错误信息的，可以将错误信息通过重定向或者抑制（-s）的方式
```
grep -r -H "import" ./ 2>/dev/null

grep -r -H -s "import" ./
```

## 参数列表

grep很强大，我们可以用来过滤自己想要的信息，很多人最常用的就是`ps -aux | grep xxx`，在日常工作中可以尽可能挖掘他的功能。

grep的常用参数
```
-r – 递归搜索
-R – 在每一个目录下面递归搜索，同时会搜索链接的文件。
-n – 打印出搜索到的内容在文件中的行
-s – 抑制错误的信息，包括文件不存在或者不可读的文件
-w – 只根据整个搜索词汇的值来搜索，而不是以正则表达式匹配的形式
-i – 忽略大小写去搜索
-a - 将 binary 文件以 text 文件的方式搜寻数据
-c - 计算找到 '搜寻字符串' 的次数
-v - 反向选择，亦即显示出没有 '搜寻字符串' 内容的那一行
-E - 使用正则表达式

-A - 后面跟数字n，表示显示搜索得到的结果以及前n行
-B - 后面跟数字n，表示显示搜索得到的结果以及后n行
-C - 后面跟数字n，表示显示搜索得到的结果以及前后n行

--color - 对grep出的结果进行颜色区分
```