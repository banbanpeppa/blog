---
layout:     post
title:      Spring-Boot + HTTPS
date:       2019-04-28 17:00:00
author:     "banban"
header-img: "/images/java/spring-boot.jpg"
catalog: true
tags:
    - Java
    - Spring Boot
---

# Spring-Boot实现HTTPS
传输层安全性协议（英语：Transport Layer Security，缩写作 TLS），及其前身安全套接层（Secure Sockets Layer，缩写作 SSL）是一种安全协议，目的是为互联网通信，提供安全及数据完整性保障。网景公司（Netscape）在1994年推出首版网页浏览器，网景导航者时，推出HTTPS协议，以SSL进行加密，这是SSL的起源。IETF将SSL进行标准化，1999年公布第一版TLS标准文件。随后又公布RFC 5246 （2008年8月）与 RFC 6176 （2011年3月）。在浏览器、电子邮件、即时通信、VoIP、网络传真等应用程序中，广泛支持这个协议。主要的网站，如Google、Facebook等也以这个协议来创建安全连接，发送数据。目前已成为互联网上保密通信的工业标准。

SSL包含记录层（Record Layer）和传输层，记录层协议确定传输层数据的封装格式。传输层安全协议使用X.509认证，之后利用非对称加密演算来对通信方做身份认证，之后交换对称密钥作为会谈密钥（Session key）。这个会谈密钥是用来将通信两方交换的数据做加密，保证两个应用间通信的保密性和可靠性，使客户与服务器应用之间的通信不被攻击者窃听。
 
## 生成证书
使用Java的Keytool生成证书
```
[banban:~ chenzhiling$ which keytool
/Library/Java/JavaVirtualMachines/jdk1.8.0_191.jdk/Contents/Home/bin/keytool
[banban:~ chenzhiling$ keytool 
密钥和证书管理工具

命令:

 -certreq            生成证书请求
 -changealias        更改条目的别名
 -delete             删除条目
 -exportcert         导出证书
 -genkeypair         生成密钥对
 -genseckey          生成密钥
 -gencert            根据证书请求生成证书
 -importcert         导入证书或证书链
 -importpass         导入口令
 -importkeystore     从其他密钥库导入一个或所有条目
 -keypasswd          更改条目的密钥口令
 -list               列出密钥库中的条目
 -printcert          打印证书内容
 -printcertreq       打印证书请求的内容
 -printcrl           打印 CRL 文件的内容
 -storepasswd        更改密钥库的存储口令

使用 "keytool -command_name -help" 获取 command_name 的用法
```
输入
```
keytool -genkey -storetype PKCS12 -keysize 2048 -alias tomcat -keyalg RSA -keystore ./tomcat.keystore
```
结果如下
```
输入密钥库口令:  
再次输入新口令: 
您的名字与姓氏是什么?
  [Unknown]:  chen
您的组织单位名称是什么?
  [Unknown]:  scut
您的组织名称是什么?
  [Unknown]:  scut
您所在的城市或区域名称是什么?
  [Unknown]:  guangzhou
您所在的省/市/自治区名称是什么?
  [Unknown]:  guangzhou
该单位的双字母国家/地区代码是什么?
  [Unknown]:  CN
CN=chen, OU=scut, O=scut, L=guangzhou, ST=guangzhou, C=CN是否正确?
  [否]:  是

```

得到了`tomcat.keystore`之后将证书放置到项目根目录

## 配置HTTPS
在spring-boot项目的`application.properties`配置文件下增加配置如下
```
server.port=8843

server.ssl.key-store=tomcat.keystore
server.ssl.key-store-password=<password>
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
```
其中`<password>`是在生成证书的时候设置的口令

定义HTTPS的配置类
```
import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HttpsConfiguration {

	/**
	 * @author chenzhiling
     * @since spring boot 2.0
     * @return
     */
    @Bean
    public TomcatServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint constraint = new SecurityConstraint();
                constraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/*");
                constraint.addCollection(collection);
                context.addConstraint(constraint);
            }
        };
        tomcat.addAdditionalTomcatConnectors(httpConnector());
        return tomcat;
    }

    @Bean
    public Connector httpConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        //Connector监听的http的端口号
        connector.setPort(6161);
        connector.setSecure(false);
        //监听到http的端口号后转向到的https的端口号
        connector.setRedirectPort(8843);
        return connector;
    }
}
```
本人在配置该HTTPS的时候使用的spring版本信息为
```
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.3.RELEASE</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
```
之后访问资源的时候可以通过`https://host:8843/`来访问，如果访问方式为`http://host:6161/`会跳转到HTTPS端口。