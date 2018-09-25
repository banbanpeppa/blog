---
layout:     post
title:      "Hello Blog"
subtitle:   " \"Hello World\""
date:       2018-09-20 12:00:00
author:     "banban"
header-img: "/images/life/hello-world-bg.jpg"
catalog: true
tags:
    - 随笔
---

> “我也开始写博客了. ”


## 前言

折腾了好一会儿，banban 的 Blog 也算是开通了。

在选用这个模板之前，对比了很多Blog模板，最终是选择了两个模板，一个是[Hux](https://github.com/Huxpro/huxpro.github.io)，另一个是[Nodepad](https://github.com/hmfaysal/Notepad)。

当然了，我前端写的不多，不能自己撸一个漂亮的模板出来。


2018 年了，banban 总算装逼一个大佬程序员，有自己的 Blog 了，其实自己想拥有一个博客，主要也是因为自己在去网易游戏实习了两个月之后，接触了一些大牛，了解了大牛做技术的态度，也深深感受到，其实这么久了，自己好像都没有认认真真去对待做程序员这件事情，一直都在看别人的博客，有问题就Goolge，看别人的博客，自己的总结却很少。

后来开始自己也总结了，起初用了印象笔记，但是印象笔记编写就和写Word文件一样，很不友好，而一个博客在将来自己是否会倒回来看很多时候取决于排版是否优雅，看到印象里面不同的文字风格，是在是难受。

后来还是选择用markdown文件来编写文档，书写记录。很好写，于是就换了网易云笔记。但是，笔记共享出去 ———— 难看啊！真心难看。

实习的时候，由于做的项目和 [kubeflow](https://github.com/kubeflow) 相关，同时也了解到一位大牛 [gaocegege](http://gaocegege.com/Blog/)，他是 kubeflow 的 Maintainer ，很大牛，看看人家博客那么漂亮，心动了！意识到写博客是这么享受的一件事，就好像是一个程序员编写的秘籍，不管牛不牛逼，你自己真的觉得自己牛逼了一把！

那说什么呢！ 搞一个吧！


## 正文

接下来说说搭建这个博客的技术细节。  

主要用了 [GitHub Pages](https://pages.github.com/) + [Jekyll](http://jekyllrb.com/) 快速 Building Blog 的技术方案，这个方案我看是目前来说很主流的做法了，当然 Hexo 也很多人用。

其优点非常明显：

* **Markdown** 带来的优雅写作体验
* 非常熟悉的 Git workflow ，**Git Commit 即 Blog Post**
* 利用 GitHub Pages 的域名和免费无限空间，不用自己折腾主机
* 如果需要自定义域名，也只需要简单改改 DNS 加个 CNAME 就好了 
* Jekyll 的自定制非常容易，基本就是个模版引擎


安装Jekyll

```
sudo apt-get install ruby ruby-dev build-essential

echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME=$HOME/gems' >> ~/.bashrc
echo 'export PATH=$HOME/gems/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

gem install jekyll bundler
gem install pygments.rb
gem install jekyll-paginate
```


## 后记

有了自己的博客，怎么说都算是一个新的开始！未来在这里，记录一些琐事，当然更多是记录我学习的东西！

多写东西对自己也是锻炼。

有次问了下女朋友，你想要一个自己的网站吗？她说她不会也不想整。全当我在这也给你一片地，说不定你也想来说几句呢，2333333

—— banban 后记于 2018.09.20


