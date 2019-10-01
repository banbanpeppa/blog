---
layout:     post
title:      Linux命令 - find
subtitle:   keep moving ...
date:       2019-08-15 16:23:00
author:     "banban"
header-img: "/images/linux/linux_bg_2.png"
catalog: true
tags:
    - Linux
---

find命令让用户能够在系统上根据目录执行文件搜索，同时还可以对结果进行一些后续操作。它是GNU的findutils工具的一个子模块，并且和其他的工具一同形成了强大的文件搜索功能。find工具具有很强的灵活性，可以根据一些特定的条件来搜索文件或者目录，同时还可以根据一些条件参数来处理获取到的结果。

## FindUtils

GNU Find Utilities是一个在GNU操作系统下基本的文件目录搜索工具集合，这些程式通常用于与其他的一些程式结合一起使用，进而实现模块化的强大的文件目录搜索能力。

Find Utilities工具主要包含了如下：

- find - 在对应目录下面搜索对应的文件
- locate - 把在数据库中符合一定格式的文件列出来
- updatedb - 更新一个文件名数据库
- xargs - 根据标准输入来构建一个可执行命令

find工具在一个目录树下去寻找一系列的文件，它会搜寻对应的目录树并且处理得到那些符合用户预设好条件的文件。

locate工具会搜索一个或者多个文件名的数据库，并且将符合条件的文件名打印出来，通常locate命令会结合updatedb命令使用，updatedb会更新整个系统的文件信息，之后locate命令可以定位到对应的文件内容。locate的查询效率是非常高的，只要对应的database更新了，就能快速定位到文件。

updatedb程序就是维护一个文件名数据库，这个数据库会被locate程序使用，这个文件名数据库会维护一系列的目录树组成的文件列表，updatedb命令执行的时候会更新对应的目录树，这个程序可以交给cron来做定时更新，每天跟新以此即可。如果再平时使用的时候想要用最新的数据库，手动执行updatedb即可。

xargs 程序从标准输入流中获取得到一些列内容作为参数，并提供给后续的命令或程序使用，例如一个非常常见的例子就是讲find命令得到的文件名收集在一起作为参数，提供后续的删除操作等等：
```
find . -type f | xargs ls -lkh
```

具体的FileUtils功能可以查看[Findutils](https://www.gnu.org/software/findutils/)

## find的使用

接下来介绍find命令的使用，同时会根据其提供的参数举例子。

find命令的基础用法是
```bash
find [paths] [expression] [actions]
```
find命令允许用户传入多个paths，其会根据不同的path递归的去在每一个path下面寻找用户想要的文件，知道全部找完。默认find命令会把paths下面的所有paths都走一遍因为为了能够寻找对应满足一定要求的path下面的文件，可以使用正则表达式来表示对应的path。

同时find命令也可以对寻找得到的结果进行一些处理，默认是直接输出找到的所有文件，为了能够根据一定的要求来寻找对应的文件，用户可以使用对应的一些action来过滤或者处理文件。

接下来根据几个例子来加强对find命令的理解

### find 所有的文件和目录

有时候用户想要将某一个目录下面的所有文件和目录都显示出来，find命令默认能实现这个功能，例如将/usr/bin下面的所有文件找出来
```bash
$ find /usr/bin/
/usr/bin/
/usr/bin/dpkg
/usr/bin/dpkg-deb
/usr/bin/dpkg-divert
/usr/bin/dpkg-maintscript-helper
/usr/bin/dpkg-query
/usr/bin/dpkg-split
/usr/bin/dpkg-statoverride
/usr/bin/dpkg-trigger
/usr/bin/update-alternatives
/usr/bin/debconf
/usr/bin/debconf-apt-progress
/usr/bin/debconf-communicate
/usr/bin/debconf-copydb
/usr/bin/debconf-escape
/usr/bin/debconf-set-selections
/usr/bin/debconf-show
/usr/bin/deb-systemd-helper
/usr/bin/deb-systemd-invoke
/usr/bin/ischroot
...
```

会看到这个文件列表非常大，因为它把`/usr/bin`目录下面的所有文件和目录都显示出来了，包括`/usr/bin`目录本身。

如果想要从一堆的文件目录中寻找出所有的文件，则可以在find后面追加不同的path
```bash
find /usr/share /bin /usr/lib
```
如果想要把当前目录的所有文件都找出来
```bash
find .
```
或者
```bash
find
```

### find by name

有时候我们只想根据文件的名字来寻找对应的文件，则可以使用`-name`的action来实现
```bash
find . -name hello.txt
```
这种方式是根据文件的全名来寻找的，也就是说`-name`的默认行为就是根据文件的全名来寻找。

如果说用户不能确定文件的大小写，可以用`-iname`来寻找
```bash
find /usr -iname hello.txt
```

如果用户连文件的完整名字也无法确定，只想通过模糊匹配的形式来寻找文件，则可以使用正则表达式来寻找
```bash
find /usr -name '*.txt'
```
如果想根据文件名的长度来寻找文件，例如想寻找路径下文件的字符数目是4的文件
```bash
find /usr -name '????'
```
在一些情况下，用户想要寻找某一个特定的目录下面的符合要求的文件，而不是将整个目录中的所有符合要求的文件都显示出来，则可以使用`-path`。例如一个目录下面有很多目录，现在想要在tmp目录下面寻找出文件名字符数为3的文件或目录，则可以执行
```bash
find . -path '*tmp/???'
```
同时也有一个`-ipath`的action来忽略掉大小写的操作

### find 文件类型

在Linux系统下面，所有的东西都是以文件的形式存在。

在一些情况下，用户不想找出目录，只想找出对应路径下满足条件的文件，这个时候就可以使用`-type`的action来寻找。

`-type`的类型比较常见的有

* f: 文件
* d: 目录
* l: 软链接

例如，找出tmp目录下面出了目录的文件
```bash
find tmp -type f
```
自然，用户可组合不同的actions来寻找文件，例如只找出txt后缀的文件
```bash
find tmp -type f -name '*.txt'
```

### find 空文件或者空目录

find命令支持寻找空的文件或者空的目录
```bash
find /tmp -empty
```
### 否定action

find命令可以根据action的否定来处理寻找的文件结果。

例如可以寻找出了后缀为`.txt`的文件
```bash
find . ! -name '*.txt'
```
或者寻找出了空文件或者空目录以外的文件
```bash
find . ! -empty
```

### 根据文件属主寻找

find命令可以根据文件的属主来寻找。例如想要寻找文件属主为chenzhiling的文件
```bash
find . -username chenzhiling
```
`-username`接受的参数值可以使username或者UID，想要获取对应用户的UID可以通过
```bash
id -u chenzhiling
```

同时也可以根据用户所在的组或者GID来寻找对应的文件
```bash
find . -group root
```
如果想要使用GID来寻找，可以通过下面的命令获取对应的GID
```
id -g chenzhiling
```

### 根据文件的时间寻找

文件在创建之后就会有三个时间跟随着文件。着三个时间分别是mtime、atime、ctime。他们分别表示

* mtime - 文件的内容被修改的时候更新的时间
* atime - 文件被访问的时候被更新的时间
* ctime - 文件的元信息被修改（例如权限）的时候更新的时间

为此我们可以使用`-mtime`、`-atime`、`-ctime`的action来寻找对应的文件。

例如寻找在五天内被修改的文件
```bash
find . -mtime -5 -type f
```
寻找在五天以前被修改的文件
```bash 
find . -mtime +5 -type f
```
寻找文件在五天前（就在第五天前）被修改的文件
```bash 
find . -mtime 5 -type f
```

以此类推另外两个action的用法类似。

如果觉得使用天来寻找太长了， find还提供了使用`mmin`、`amin`、`cmin`这种分钟级别的action来寻找，例如寻找在5分钟以内被访问的文件
```bash
find . -type f -amin -5
```

### 根据文件大小来寻找
在一些时候，用户想要寻找一些大于某个大小或者小于某一个大小的文件，这个时候可以使用`-size`来寻找
```
find . -type f -size -10M
```
以上命令把目录下面小于10MB的文件都找出来。

文件的大小主要分为了4类

* c - bytes
* k - kb
* M - MB
* G - GB

### 根据文件权限来寻找

根据文件权限来寻找文件使用`-perm`，他有两种方式来寻找，一种是根据权限的标识，另一种用权限的数字。

我们知道在Linux系统中，文件的权限主要分为了User、Group和Other级别的权限。如下图所示
![image](/images/linux/permissions.jpg)

例如要寻找文件权限为`rwxr-xr-x`的文件，
```bash 
find . -type f -perm u=rwx,g=rx,o=x
```
同时为了寻找对于所有的用户权限都是一样的情况，可以使用a来表示，例如寻找文件权限为`r-xr-xr-x`的文件，这个文件对于所有的用户的权限都是一样的，则可以使用
```bash 
find . -type f -perm a=rx
```
为了寻找某一类文件，只想关心它有执行权限`x`，其他的权限可以设置，也可以没有，这个时候不能只是简单的设置`-perm a=x`，因为这表示的是要寻找的文件对于所有的用户都只有执行权限，即`--x--x--x`，这时候可以用`-perm /a=x`的形式来寻找那些包含了执行权限的文件，但是别的权限为可以是有或者无
```bash
find . -type f -perm /a=x
```

使用权限数字来寻找文件，则直接在`-perm`后面追加数字为参数即可。例如某一个文件的权限是`rwxr-xr-x`，这个权限对应的数字表示模式为644，则寻找文件的时候可以
```bash
find . -type f -perm 644
```

同样的，在只想关心某一个权限位的时候，find也有一个表示的方式。例如上面的图中，我们想要找一系列文件，值关心这个文件是否有执行权限`x`，那么每个权限位置的x位置都设置为1，其它不关心的设置为0，也就是111。这时候在111前面加上`-`就可以实现只处理权限的子集了。
```bash
find . -type f -perm -111
```
那么如果说使用
```
find . -type f -perm -000
```
则其实-perm的效果就失效了。

### 寻找SUID文件
在上面学会了使用数字模式的权限寻找文件了，那么如果想要寻找具有SUID权限的文件，其实就是一样的做法，只关心SUID的权限位置，其余权限都不管
```bash
find .  -type f -perm -4000
```
同样的，先刚查看有setuid的权限文件的同时想查看具有执行权限的文件
```bash 
find . -type f -perm -4111
```
查看设置了setgid的文件
```bash 
find . -type -f -perm -2000
```
查看设置了粘滞位的文件
```bash
find . -type -f -perm -1000
```
这个sticky位比较神奇，有兴趣可以Google一下。

查看设置了setuid和sticky的该怎么找呢，当然这个属于比较少见到的文件了，权限的格式类似于`--s-----t`，find命令只要求将这里两个权限数字模式相加即可，也就是5000
```bash 
find . -type f -perm -5000
```

如果想要使用权限标识来表示，则可以
```bash
find . -type f -perm /u=s

find . -type f -perm /g=s

find . -type f -perm /o=t
```

### 设置查询深度

前面提到了find寻找文件是通过路径去递归查询的，那么有时候有些目录下面的文件深度非常深，则会导致搜索的结果非常庞大。这时候可以使用`-maxdepth`来限制搜索的深度
```bash
find . -type f -maxdepth 3
```
反过来也可以设置最小的搜索深度
```bash
find . -type f -mindepth 3
```

## 参考

* [A Guide to the Linux “Find” Command](https://www.booleanworld.com/guide-linux-find-command/)
* [man find](http://man7.org/linux/man-pages/man1/find.1.html)