---
layout:     post
title:      一键脚本搭建SS/搭建SSR服务并开启BBR加速
date:       2019-02-18 11:00:00
author:     "banban"
header-img: "/images/essay/vpn-bg.jpg"
catalog: true
tags:
    - 随笔
---

别人写的一个脚本，直接部署SS/SSR翻墙服务。话不多说，直接贴方法

## 安装SSR
1\. 下载一键搭建ssr脚本（只需要执行一次，卸载ssr后也不需要重新执行）
```
git clone https://github.com/banbanpeppa/ss-fly.git
```

2\. 执行脚本
```
cd ss-fly
./ss-fly.sh -ssr
```

3\. 输入对应的参数

执行完上述的脚本代码后，会进入到输入参数的界面，包括服务器端口，密码，加密方式，协议，混淆。可以直接输入回车选择默认值，也可以输入相应的值选择对应的选项：
```
4) aes-128-cfb
6) auth_aes128_sha1
6) tls1.2_ticket_auth
```
全部选择结束后，会看到如下界面，就说明搭建ssr成功了：
```
Congratulations, ShadowsocksR server install completed!
Your Server IP        :你的服务器ip
Your Server Port      :你的端口
Your Password         :你的密码
Your Protocol         :你的协议
Your obfs             :你的混淆
Your Encryption Method:your_encryption_method
 
Welcome to visit:https://shadowsocks.be/9.html
Enjoy it!
```

4\. 相关操作ssr命令
```
启动：/etc/init.d/shadowsocks start
停止：/etc/init.d/shadowsocks stop
重启：/etc/init.d/shadowsocks restart
状态：/etc/init.d/shadowsocks status
```
```
配置文件路径：/etc/shadowsocks.json
日志文件路径：/var/log/shadowsocks.log
代码安装目录：/usr/local/shadowsocks
```
5\. 卸载ssr服务
```
./shadowsocksR.sh uninstall
```

## SSR工具包下载

https://github.com/banbanpeppa/banbanpeppa.github.io/releases/tag/v1.0

### Windows

SSR_for_win.zip [下载地址](https://github.com/banbanpeppa/banbanpeppa.github.io/releases/tag/v1.0)

### Android

shadowsocksr-release.apk [下载地址](https://github.com/banbanpeppa/banbanpeppa.github.io/releases/tag/v1.0)

## Preference

github：https://github.com/banbanpeppa/ss-fly
