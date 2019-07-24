---
layout:     post
title:      MAC终端神器iterm2
subtitle:   " \"告别黑白\""
date:       2019-07-20 12:00:00
author:     "banban"
header-img: "/images/essay/term2bg.jpg"
catalog:    true
tags:
    - 随笔
---

# MAC终端神器iterm2——告别黑白

> 转载：https://www.cnblogs.com/soyxiaobi/p/9695931.html

## 最终效果:
![image](/images/essay/ohmyzsh.png)

## 实现步骤

**1\. 下载iTerm2**

官网下载：https://www.iterm2.com/

安装完成后，在/bin目录下会多出一个zsh的文件。

Mac系统默认使用dash作为终端，可以使用命令修改默认使用zsh：
```
chsh -s /bin/zsh
```
> zsh完美代替bash,具体区别可查看:[《Zsh和Bash区别》](https://www.xshell.net/shell/bash_zsh.html)

**iterm2的原始界面**

![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/1.png)

**2\. 替换背景图片**

打开路径:iterm2 -> Preferences -> Profiles -> window -> Background Image

选择一张自己喜欢的壁纸即可

可以通过Blending调节壁纸的透明度: 透明度为0的时候,背景变为纯色(黑色)

我个人比较喜欢扁平化的壁纸,喜欢的朋友可以来这里看看:
[《有哪些优雅的 Windows 10 壁纸？》](https://www.zhihu.com/question/37811449)

**3\. 安装Oh my zsh**

zsh的功能极其强大，只是配置过于复杂,通过*Oh my zsh*可以很快配置zsh。

这里只做简单的配置,如需要深入了解,可以查看:[《oh-my-zsh,让你的终端从未这么爽过》](https://www.jianshu.com/p/d194d29e488c?open_source=weibo_search)

安装方法有两种，可以使用curl或wget，看自己环境或喜好：
```
# curl 安装方式
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```
```
# wget 安装方式
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
oh-my-zsh开源地址：《oh-my-zsh》
```

**4\. 安装PowerLine**

安装powerline:
```
pip install powerline-status --user
```
**5\. 安装PowerFonts**

在常用的位置新建一个文件夹，如：~/Desktop/OpenSource/

在OpenSource文件夹下下载PorweFonts:
```
# git clone
git clone https://github.com/powerline/fonts.git --depth=1

# cd to folder
cd fonts

# run install shell
./install.sh
```
执行结果如下：
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/6.png)

安装好字体库之后，我们来设置iTerm2的字体，具体的操作是:
```
iTerm2 -> Preferences -> Profiles -> Text
```
在Font区域选中Change Font，然后找到Meslo LG字体。
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/7.png)

**6\. 安装配色方案(可跳过)**

在OpenSource目录下执行`git clone`命令:
```
git clone https://github.com/altercation/solarized

cd solarized/iterm2-colors-solarized/
open .
```
在打开的finder窗口中，双击Solarized Dark.itermcolors和Solarized Light.itermcolors即可安装明暗两种配色：
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/8.png)

再次进入`iTerm2 -> Preferences -> Profiles -> Colors -> Color Presets`中根据个人喜好选择.

**7\. 安装主题**

在OpenSource目录下执行git clone命令:
```
git clone https://github.com/fcamblor/oh-my-zsh-agnoster-fcamblor.git

cd oh-my-zsh-agnoster-fcamblor/
./install
```
执行上面的命令会将主题拷贝到`oh my zsh`的themes.

执行命令打开`zshrc`配置文件，将ZSH_THEME后面的字段改为agnoster
```
vi ~/.zshrc
```
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/11.png)

此时command+Q或source配置文件后，iTerm2变了模样：
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/12.png)

**8\. 安装高亮插件**

这是oh my zsh的一个插件，安装方式与theme大同小异：
```
cd ~/.oh-my-zsh/custom/plugins/

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
vi ~/.zshrc
```
这时我们再次打开zshrc文件进行编辑。找到plugins，此时plugins中应该已经有了git，我们需要把高亮插件也加上：
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/13.png)

请务必保证插件顺序，zsh-syntax-highlighting必须在最后一个。

然后在文件的最后一行添加：
```
source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```
执行命令使刚才的修改生效：
```
source ~/.zshrc
```

**9\. 可选择、命令补全**

跟代码高亮的安装方式一样，这也是一个zsh的插件，叫做`zsh-autosuggestion`，用于命令建议和补全。
```
cd ~/.oh-my-zsh/custom/plugins/

git clone https://github.com/zsh-users/zsh-autosuggestions
vi ~/.zshrc
```
找到plugins，加上这个插件即可：
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/15.png)

插件效果：
![image](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/16.png)

有同学说补全命令的字体不太清晰，与背景颜色太过相近，其实可以自己调整一下字体颜色。

`Preferences -> Profiles -> Colors`中有Foreground是标准字体颜色，ANSI Colors中Bright的第一个是补全的字体颜色。

## 参考
* [《iTerm2 + Oh My Zsh 打造舒适终端体验》](https://github.com/sirius1024/iterm2-with-oh-my-zsh)
* [主题列表](https://github.com/robbyrussell/oh-my-zsh/wiki/themes)