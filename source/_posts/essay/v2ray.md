---
layout:     post
title:      搭建v2ray
date:       2019-03-29 19:21:00
author:     "banban"
header-img: "/images/essay/vpn-bg.jpg"
catalog: true
tags:
    - 随笔
---

之前使用vultr的VPS搭建SSR，三天两头被查，出不去的心情非常低落。于是采用另一个工具v2ray，使用之后发现稳定性高了很多。话不多说，搞起！

## 什么是V2Ray
Project V 提供了单一的内核和多种界面操作方式。内核（V2Ray）用于实际的网络交互、路由等针对网络数据的处理，而外围的用户界面程序提供了方便直接的操作流程，简单来说，V2Ray就是一个代理软件，可以用来科学上网学习国外先进科学技术。

## V2Ray与Shadowsocks区别
V2Ray是在Shadowsocks的作者被请喝茶之后出现的一个开源项目，目的就是为了更好的科学上网。相比于ss，V2Ray的定位是一个平台，任何开发者都可以在这个平台上利用V2Ray开发出一个新的代理软件，简单来说，ss的定位比较简单，功能也比较单一，而V2Ray的功能非常强大，相对的，V2Ray的配置就会复杂很多。

## V2Ray的优势
- 更完善的协议: V2Ray 使用了新的自行研发的 VMess 协议，改正了 Shadowsocks 一些已有的缺点，更难被检测到（不保证可靠性）
- 更强大的性能: 网络性能更好，具体数据可以看 V2Ray 官方博客
- 更丰富的功能: 以下是部分 V2Ray 的功能
- mKCP: KCP 协议在 V2Ray 上的实现，不必另行安装 kcptun
- 动态端口：动态改变通信的端口，对抗对长时间大流量端口的限速封锁
- 路由功能：可以随意设定指定数据包的流向，去广告、反跟踪都可以
- 传出代理：看名字可能不太好理解，其实差不多可以称之为多重代理。类似于 Tor 的代理
- 数据包伪装：类似于 Shadowsocks-rss 的混淆，另外对于 mKCP 的数据包也可伪装，伪装常见流量，令识别更困难
- WebSocket 协议：可以 PaaS 平台搭建V2Ray，通过 WebSocket 代理。也可以通过它使用 CDN 中转，抗封锁效果更好
- Mux:多路复用，进一步提高科学上网的并发性能

## 一键脚本搭建V2Ray
直接执行：
```
wget https://raw.githubusercontent.com/banbanpeppa/ss-fly/master/v2ray.sh && chmod +x v2ray.sh && ./v2ray.sh
```
执行结果如下
```
--2019-03-29 19:31:17--  https://raw.githubusercontent.com/banbanpeppa/ss-fly/master/v2ray.sh
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 151.101.108.133
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|151.101.108.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2292 (2.2K) [text/plain]
Saving to: ‘v2ray.sh’

v2ray.sh                                     100%[==============================================================================================>]   2.24K  --.-KB/s    in 0s      

2019-03-29 19:31:18 (50.5 MB/s) - ‘v2ray.sh’ saved [2292/2292]

Installing V2Ray v4.18.0 on x86_64
Downloading V2Ray: https://github.com/v2ray/v2ray-core/releases/download/v4.18.0/v2ray-linux-64.zip
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   608    0   608    0     0    472      0 --:--:--  0:00:01 --:--:--   473
100 10.5M  100 10.5M    0     0  1900k      0  0:00:05  0:00:05 --:--:-- 3469k
Updating software repo
Installing unzip
Selecting previously unselected package unzip.
(Reading database ... 136355 files and directories currently installed.)
Preparing to unpack .../unzip_6.0-20ubuntu1_amd64.deb ...
Unpacking unzip (6.0-20ubuntu1) ...
Processing triggers for mime-support (3.59ubuntu1) ...
Processing triggers for man-db (2.7.5-1) ...
Setting up unzip (6.0-20ubuntu1) ...
Extracting V2Ray package to /tmp/v2ray.
Archive:  /tmp/v2ray/v2ray.zip
  inflating: /tmp/v2ray/config.json  
   creating: /tmp/v2ray/doc/
  inflating: /tmp/v2ray/doc/readme.md  
  inflating: /tmp/v2ray/geoip.dat    
  inflating: /tmp/v2ray/geosite.dat  
   creating: /tmp/v2ray/systemd/
  inflating: /tmp/v2ray/systemd/v2ray.service  
   creating: /tmp/v2ray/systemv/
  inflating: /tmp/v2ray/systemv/v2ray  
  inflating: /tmp/v2ray/v2ctl        
 extracting: /tmp/v2ray/v2ctl.sig    
  inflating: /tmp/v2ray/v2ray        
 extracting: /tmp/v2ray/v2ray.sig    
  inflating: /tmp/v2ray/vpoint_socks_vmess.json  
  inflating: /tmp/v2ray/vpoint_vmess_freedom.json  
Shutting down V2Ray service.
Failed to stop v2ray.service: Unit v2ray.service not loaded.
Failed to shutdown V2Ray service.
PORT:16928
UUID:43d27c77-fd22-47d4-8fb7-93973a56b920
Created symlink from /etc/systemd/system/multi-user.target.wants/v2ray.service to /etc/systemd/system/v2ray.service.
Restarting V2Ray service.
V2Ray v4.18.0 is installed.
```
此脚本会自动安装以下文件：
```
/usr/bin/v2ray/v2ray：V2Ray 程序
/usr/bin/v2ray/v2ctl：V2Ray 工具
/etc/v2ray/config.json：配置文件
/usr/bin/v2ray/geoip.dat：IP 数据文件
/usr/bin/v2ray/geosite.dat：域名数据文件
```
用这个一键脚本安装好V2Ray后，可以通过如下命令控制V2Ray的开启、关闭、重启、查看状态等：
```
service v2ray start|stop|status|reload|restart|force-reload
```

## 配置V2Ray服务器
V2Ray的配置文件在`/etc/v2ray/config.json`，先删除这个配置文件
```
rm /etc/v2ray/config.json
```
之后在V2Ray配置[在线生成器](https://intmainreturn0.com/v2ray-config-gen/)生成对应的服务器配置，选择好对应的配置后(取消勾选是否是动态端口和是否是mKCP协议)，其中用户uuid是用来识别用户的，服务器端和客户端要一致，直接点击服务器配置下方的复制配置。也可以用如下的一个模板
```
{
    "log": {
        "access": "/var/log/v2ray/access.log",
        "error": "/var/log/v2ray/error.log",
        "loglevel": "warning"
    },
    "inbound": {
        "port": 12345,
        "protocol": "vmess",
        "settings": {
            "clients": [
                {
                    "id": "aab9c609-44c4-eb73-aa1f-c6611657409c",
                    "level": 1,
                    "alterId": 100
                }
            ]
        },
        "streamSettings": {
            "network": "kcp"
        },
        "detour": {
            "to": "vmess-detour-345411"
        }
    },
    "outbound": {
        "protocol": "freedom",
        "settings": {}
    },
    "inboundDetour": [
        {
            "protocol": "vmess",
            "port": "10000-10010",
            "tag": "vmess-detour-345411",
            "settings": {},
            "allocate": {
                "strategy": "random",
                "concurrency": 5,
                "refresh": 5
            },
            "streamSettings": {
                "network": "kcp"
            }
        }
    ],
    "outboundDetour": [
        {
            "protocol": "blackhole",
            "settings": {},
            "tag": "blocked"
        }
    ],
    "routing": {
        "strategy": "rules",
        "settings": {
            "rules": [
                {
                    "type": "field",
                    "ip": [
                        "0.0.0.0/8",
                        "10.0.0.0/8",
                        "100.64.0.0/10",
                        "127.0.0.0/8",
                        "169.254.0.0/16",
                        "172.16.0.0/12",
                        "192.0.0.0/24",
                        "192.0.2.0/24",
                        "192.168.0.0/16",
                        "198.18.0.0/15",
                        "198.51.100.0/24",
                        "203.0.113.0/24",
                        "::1/128",
                        "fc00::/7",
                        "fe80::/10"
                    ],
                    "outboundTag": "blocked"
                }
            ]
        }
    }
}
```
> 需要修改的参数主要包括以下三个参数 
> `inbound.port` = `12345` 
> `inbound.settings.clients[0].id` = `aab9c609-44c4-eb73-aa1f-c6611657409c` 
> `inbound.settings.clients[0].alterId` = `100`

之后新建一个配置文件：`vim /etc/v2ray/config.json`，把生成的配置拷贝进去即可。

最后，启动V2Ray
```
service v2ray restart
```

查看V2Ray的状态
```
# service v2ray status

● v2ray.service - V2Ray Service
   Loaded: loaded (/etc/systemd/system/v2ray.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2019-03-29 15:37:10 CST; 4h 17min ago
 Main PID: 695 (v2ray)
   CGroup: /system.slice/v2ray.service
           └─695 /usr/bin/v2ray/v2ray -config /etc/v2ray/config.json

Mar 29 15:37:10 v2ray systemd[1]: Started V2Ray Service.
Mar 29 15:37:10 v2ray v2ray[695]: V2Ray 4.18.0 (Po) 20190228
Mar 29 15:37:10 v2ray v2ray[695]: A unified platform for anti-censorship.
```
## 配置V2Ray客户端

### Windows
windows下面建议使用v2rayN: https://github.com/2dust/v2rayN/releases， 强大好用，不用配置浏览器。客户端会用到配置文件模板如下：
```
{
    "log": {
        "loglevel": "warning"
    },
    "inbound": {
        "listen": "127.0.0.1",
        "port": 1081,
        "protocol": "socks",
        "settings": {
            "auth": "noauth",
            "udp": true,
            "ip": "127.0.0.1"
        }
    },
    "outbound": {
        "protocol": "vmess",
        "settings": {
            "vnext": [
                {
                    "address": "192.168.10.1",
                    "port": 12345,
                    "users": [
                        {
                            "id": "c383e9af-8d5a-9d58-9c14-9d1bc2363ff9",
                            "level": 1,
                            "alterId": 100
                        }
                    ]
                }
            ]
        },
        "streamSettings": {
            "network": "kcp"
        }
    },
    "outboundDetour": [
        {
            "protocol": "freedom",
            "settings": {},
            "tag": "direct"
        }
    ],
    "routing": {
        "strategy": "rules",
        "settings": {
            "rules": [
                {
                    "type": "field",
                    "port": "54-79",
                    "outboundTag": "direct"
                },
                {
                    "type": "field",
                    "port": "81-442",
                    "outboundTag": "direct"
                },
                {
                    "type": "field",
                    "port": "444-65535",
                    "outboundTag": "direct"
                },
                {
                    "type": "field",
                    "domain": [
                        "gc.kis.scr.kaspersky-labs.com"
                    ],
                    "outboundTag": "direct"
                },
                {
                    "type": "chinasites",
                    "outboundTag": "direct"
                },
                {
                    "type": "field",
                    "ip": [
                        "0.0.0.0/8",
                        "10.0.0.0/8",
                        "100.64.0.0/10",
                        "127.0.0.0/8",
                        "169.254.0.0/16",
                        "172.16.0.0/12",
                        "192.0.0.0/24",
                        "192.0.2.0/24",
                        "192.168.0.0/16",
                        "198.18.0.0/15",
                        "198.51.100.0/24",
                        "203.0.113.0/24",
                        "::1/128",
                        "fc00::/7",
                        "fe80::/10"
                    ],
                    "outboundTag": "direct"
                },
                {
                    "type": "chinaip",
                    "outboundTag": "direct"
                }
            ]
        }
    }
}
```
其中下面部分需要修改为对应自己搭建的v2ray信息
```
"settings": {
    "vnext": [
        {
            "address": "192.168.10.1",
            "port": 12345,
            "users": [
                {
                    "id": "c383e9af-8d5a-9d58-9c14-9d1bc2363ff9",
                    "level": 1,
                    "alterId": 100
                }
            ]
        }
    ]
},
```

### MacOS
在MacOS下建议使用V2rayX工具，具体可以参考：https://github.com/Cenmrev/V2RayX ,工具非常便捷强大，配置方式也很简单。

### Android
下载地址：https://github.com/2dust/v2rayNG ，找到`release`即可

## 卸载v2ray服务
服务端如果要卸载v2ray，直接执行
```
wget https://raw.githubusercontent.com/banbanpeppa/ss-fly/master/go.sh && chmod +x go.sh && ./go.sh --remove
```
执行结果
```
Shutting down V2Ray service.
Removed symlink /etc/systemd/system/multi-user.target.wants/v2ray.service.
Removed V2Ray successfully.
If necessary, please remove configuration file and log file manually.
```

## V2Ray的优化
谷歌的BBR加速所有，一键开启方式：
```
wget hhttps://raw.githubusercontent.com/banbanpeppa/ss-fly/master/ss-fly.sh && chmod +x ss-fly.sh && ./ss-fly.sh -bbr
```

## 总结
V2Ray作为一个新兴的代理工具，好用稳定安全！

## 参考
github：https://github.com/banbanpeppa/ss-fly
一键脚本搭建V2Ray & V2Ray配置与优化： https://www.flyzy2005.com/v2ray/how-to-build-v2ray/