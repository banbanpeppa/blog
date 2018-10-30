---
layout:     post
title:      "使用SSR搭建VPN"
date:       2018-09-28 11:00:00
author:     "banban"
header-img: "/images/essay/vpn-bg.jpg"
catalog: true
tags:
    - 随笔
---

经常会需要爬梯子看看外面的世界，同时没有Google的世界是多么暗淡！弄一个吧！

## 国外VPS

既然想要搭建一个VPN，自然国外的 VPS 必须要用，可以找国内阿里云、腾讯云的一些部署在国外的虚拟机，也可以用国外的云服务商提供的。这里推荐 [VULTR](https://www.vultr.com/?ref=7530118)，便宜，还挺好用的，应该是基于`OpenStack`做的。最普通的机器只需要`$2.5`。

在租用虚拟机的时候可以选择美国或者东南亚的一些国家的机器，具体不赘述

## 使用shadowsocksr搭建VPN

进入到虚拟机内部之后下载代码

```
git clone https://github.com/SSRbackup/shadowsocksr.git
```

编辑配置文件内容如下
```
vim /etc/shadowsocksr.json
```
json内容如下
```
{
    "server": "0.0.0.0",
    "server_ipv6": "::",
    "server_port": 8488,
    "local_address": "127.0.0.1",
    "local_port": 1080,

    "password": "banban",
    "method": "aes-256-cfb",
    "protocol": "auth_aes128_sha1",
    "protocol_param": "",
    "obfs": "tls1.2_ticket_auth_compatible",
    "obfs_param": "",
    "speed_limit_per_con": 0,
    "speed_limit_per_user": 0,

    "additional_ports" : {}, // only works under multi-user mode
    "additional_ports_only" : false, // only works under multi-user mode
    "timeout": 120,
    "udp_timeout": 60,
    "dns_ipv6": false,
    "connect_verbose_info": 0,
    "redirect": "",
    "fast_open": false
}
```
启动SSR
```
cd shadowsocksr/shadowsocks

python server.py -c /etc/shadowsocksr.json -d start
```

停止SSR
```
cd shadowsocksr/shadowsocks

python server.py -c /etc/shadowsocksr.json -d stop
```

## SSR工具包下载

### Windows

SSR_for_win.zip [下载地址](https://github.com/banbanpeppa/banbanpeppa.github.io/releases/tag/v1.0)

### Android

shadowsocksr-release.apk [下载地址](https://github.com/banbanpeppa/banbanpeppa.github.io/releases/tag/v1.0)

## Preference

github：https://github.com/ssrbackup
shadowsocksr：https://github.com/ssrbackup/shadowsocksr

### 参考博客

Linux 配置SSR 客户端 : https://www.jianshu.com/p/c336fd0bdfbe

ShadowsocksR客户端下载及操作步骤 : https://www.qcgzxw.cn/301.html