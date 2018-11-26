---
layout:     post
title:      Mac pro 安装SecureCRT
date:       2018-11-25 22:36:00
author:     "banban"
header-img: "/images/blog-common-bg.jpg"
catalog: true
tags:
    - 随笔
---

# Mac pro 安装SecureCRT

1\. 先下载[SecureCRT和破解文件](https://pan.baidu.com/s/1FPhUkE4MrVbqMG7TQjuSPQ),提取码: pezb，默认下载到了当前用户的”下载”目录中

2\. 在”Finder”中 打开 “SecureCRT_7.3.6_patch_xclient.info.dmg” 并将 SecureCRT拖动到”应用程序”中. 这时SecureCRT的路径是: `/Applications/SecureCRT.app/Contents/MacOS/SecureCRT`

3\. 测试一下SecureCRT是否能打开, 如果可以,先关闭
4\. 在终端中输入 
```
sudo perl ~/Downloads/securecrt_mac_crack.pl /Applications/SecureCRT.app/Contents/MacOS/SecureCRT
```
注意： 具体目录地址根据自己而定。

如果终端中有输出下面的信息, 表示激活成功了
```
It has been cracked 
License: 
Name: bleedfly 
Company: bleedfly.com 
Serial Number: 03-29-002542 
License Key: ADGB7V 9SHE34 Y2BST3 K78ZKF ADUPW4 K819ZW 4HVJCE P1NYRC 
Issue Date: 09-17-2013
```
打开SecureCRT，输入刚才终端的数据就完成了破解
再次打开 SecureCRT 点击Enter License Data..

1) 直接Continue，空白不填写

2) 点击Enter Licence Manually

3) Name:输入bleedfly Company:输入 bleedfly.com

4) Serial number: 03-29-002542
　　　 License key: ADGB7V 9SHE34 Y2BST3 K78ZKF ADUPW4 K819ZW 4HVJCE P1NYRC

5) Issue date: 09-17-2013

6) 点击 Done

激活完成。

# Preference

https://www.jianshu.com/p/1ecac27897fd

http://xclient.info/s/securecrt.html?t=d4234c308f63d0413bfbf8935bd2738b905fe064