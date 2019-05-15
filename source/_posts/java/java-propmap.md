---
layout:     post
title:      使用JavaPropsMapper实现properties快速转化
date:       2019-01-27 10:00:00
author:     "banban"
header-img: "/images/java/java-bg.jpg"
catalog: true
tags:
    - Java
---

# 使用JavaPropsMapper实现properties快速转化

## Overview
自接触Properties以来，经常面临一个问题，有没有一个工具能够类似于spring-boot中的 `@ConfigurationProperties` 一样快速映射一个propertios文件到一个类中，如果没有那么就只能自己撸一个。

调研了一段时间，发现了[`FasterXML`](https://github.com/FasterXML)开源项目组里面有一个`jackson-dataformats-text`项目，这个项目完全满足了这个需求，里面的[`properties`](https://github.com/FasterXML/jackson-dataformats-text/tree/master/properties)模块包含了如何快速转化一个properties文件到一个类中。

仔细想想，spring-boot中默认的json序列化工具其实用的就是jackson的工具，所以`@ConfigurationProperties`应该就是根据这个工具来实现的。

## JavaPropsMapper
jackson-dataformats-text 是 Jackson（Java）数据格式模块，支持读写 Java Properties 文件，使用命名约定来确定隐含结构，是一个比较灵活的 Java 配置文件读写工具。

### Maven dependency
为了能够使用`JavaPropsMapper`，需要使用如下依赖，这个版本号是在 2019-01 最新的版本
```
<dependency>
  <groupId>com.fasterxml.jackson.dataformat</groupId>
  <artifactId>jackson-dataformat-properties</artifactId>
  <version>2.9.8</version>
</dependency>
```
### 一个例子
以下的例子包含了比较丰富的properties写法，大部分是字符串类型，`fabric.orderer.orderers[0]`是一个List集合的写法。
```
fabric.channel.name=mychannel

fabric.chaincode.name=emall_cc
fabric.chaincode.path=github.com/chaincode/emall/go
fabric.chaincode.version=1.0

fabric.orderer.domain-name=example.com
fabric.orderer.orderers[0]=orderer.example.com-grpc://120.78.160.145:7050

fabric.peer.org=org1
fabric.peer.org-name=peerOrg1
fabric.peer.msp-id=Org1MSP
fabric.peer.org-domain-name=org1.example.com
fabric.peer.name=peer0.org1.example.com
fabric.peer.eventhub-name=peer0.org1.example.com
fabric.peer.location=grpc://120.78.160.145:7051
fabric.peer.eventhub-location=grpc://120.78.160.145:7053
fabric.peer.ca-location=http://120.78.160.145:7054

fabric.ca.admin-name=admin
fabric.ca.admin-password=adminpw
```
同时直接使用在spring-boot中采用`@ConfigurationProperties`注解的类，去掉注解，但是需要注意使用jackson的注解`@JsonProperty`去处理那些本应该驼峰式的 index
```
import java.io.File;
import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.javaprop.JavaPropsMapper;
import com.fasterxml.jackson.dataformat.javaprop.JavaPropsSchema;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FabricProperties {

	public static class Channel {
		private String name;
		
		public String getName() {
			return name;
		}
		
		public void setName(String name) {
			this.name = name;
		}

		@Override
		public String toString() {
			return "Channel [name=" + name + "]";
		}
	}
	
	public static class Chaincode {
		private String name;
		private String path;
		private String version;
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getPath() {
			return path;
		}
		public void setPath(String path) {
			this.path = path;
		}
		public String getVersion() {
			return version;
		}
		public void setVersion(String version) {
			this.version = version;
		}
		@Override
		public String toString() {
			return "Chaincode [name=" + name + ", path=" + path + ", version=" + version + "]";
		}
	}
	
	public static class Orderer {
		@JsonProperty("domain-name")
		private String domainName;
		private List<String> orderers;
		public String getDomainName() {
			return domainName;
		}
		public void setDomainName(String domainName) {
			this.domainName = domainName;
		}
		public List<String> getOrderers() {
			return orderers;
		}
		public void setOrderers(List<String> orderers) {
			this.orderers = orderers;
		}
		@Override
		public String toString() {
			return "Orderer [domainName=" + domainName + ", orderers=" + orderers + "]";
		}
	}
	
	public static class Peer {
		private String org;
		@JsonProperty("org-name")
		private String orgName;
		@JsonProperty("msp-id")
		private String mspId;
		@JsonProperty("org-domain-name")
		private String orgDomainName;
		private String name;
		@JsonProperty("eventhub-name")
		private String eventhubName;
		private String location;
		@JsonProperty("eventhub-location")
		private String eventhubLocation;
		@JsonProperty("ca-location")
		private String caLocation;
		public String getOrg() {
			return org;
		}
		public void setOrg(String org) {
			this.org = org;
		}
		public String getOrgName() {
			return orgName;
		}
		public void setOrgName(String orgName) {
			this.orgName = orgName;
		}
		public String getMspId() {
			return mspId;
		}
		public void setMspId(String mspId) {
			this.mspId = mspId;
		}
		public String getOrgDomainName() {
			return orgDomainName;
		}
		public void setOrgDomainName(String orgDomainName) {
			this.orgDomainName = orgDomainName;
		}
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getEventhubName() {
			return eventhubName;
		}
		public void setEventhubName(String eventhubName) {
			this.eventhubName = eventhubName;
		}
		public String getLocation() {
			return location;
		}
		public void setLocation(String location) {
			this.location = location;
		}
		public String getEventhubLocation() {
			return eventhubLocation;
		}
		public void setEventhubLocation(String eventhubLocation) {
			this.eventhubLocation = eventhubLocation;
		}
		public String getCaLocation() {
			return caLocation;
		}
		public void setCaLocation(String caLocation) {
			this.caLocation = caLocation;
		}
		@Override
		public String toString() {
			return "Peer [org=" + org + ", orgName=" + orgName + ", mspId=" + mspId + ", orgDomainName=" + orgDomainName
					+ ", name=" + name + ", eventhubName=" + eventhubName + ", location=" + location
					+ ", eventhubLocation=" + eventhubLocation + ", caLocation=" + caLocation + "]";
		}
		
	}
	
	public static class Ca {
		@JsonProperty("admin-name")
		private String adminName;
		@JsonProperty("admin-password")
		private String adminPassword;
		
		
		public String getAdminName() {
			return adminName;
		}
		
		public void setAdminName(String adminName) {
			this.adminName = adminName;
		}
		
		public String getAdminPassword() {
			return adminPassword;
		}
		
		public void setAdminPassword(String adminPassword) {
			this.adminPassword = adminPassword;
		}

		@Override
		public String toString() {
			return "Ca [adminName=" + adminName + ", adminPassword=" + adminPassword + "]";
		}
	}
	
	private Channel channel;
	private Chaincode chaincode;
	private Orderer orderer;
	private Peer peer;
	private Ca ca;
	
	public Channel getChannel() {
		return channel;
	}
	public void setChannel(Channel channel) {
		this.channel = channel;
	}
	public Chaincode getChaincode() {
		return chaincode;
	}
	public void setChaincode(Chaincode chaincode) {
		this.chaincode = chaincode;
	}
	public Orderer getOrderer() {
		return orderer;
	}
	public void setOrderer(Orderer orderer) {
		this.orderer = orderer;
	}
	public Peer getPeer() {
		return peer;
	}
	public void setPeer(Peer peer) {
		this.peer = peer;
	}
	public Ca getCa() {
		return ca;
	}
	public void setCa(Ca ca) {
		this.ca = ca;
	}
	@Override
	public String toString() {
		return "FabricProperties [channel=" + channel + ", chaincode=" + chaincode + ", orderer=" + orderer + ", peer="
				+ peer + ", ca=" + ca + "]";
	}
	
	/**
	 * 使用jackson提供的JavaPropsMapper实现properties快速解析
	 * @return
	 */
	public static FabricProperties load() {
		JavaPropsMapper mapper = new JavaPropsMapper();

		JavaPropsSchema schema = JavaPropsSchema.emptySchema()
				.withoutHeader();
		FabricProperties fabric;
		try {
			fabric = mapper.readerFor(FabricProperties.class)
			    .with(schema)
			    .withRootName("fabric")
			    .readValue(new File(FabricProperties.class.getClassLoader().getResource("fabric.properties").getFile()));
			return fabric;
		} catch (IOException e) {
			e.printStackTrace();
			return new FabricProperties();
		}
	}
}
```
这边类上面的注解`@JsonIgnoreProperties(ignoreUnknown = true)`是为了避免在映射的时候出现未知属性的时候出现错误。

最后`load()`方法便是使用`JavaPropsMapper`实现properties文件到配置类的映射。

# 参考
[Blog] [Reading/writing Java properties files using Jackson (2.8)](https://medium.com/@cowtowncoder/reading-writing-java-properties-files-using-jackson-2-8-efd7a8da9d4c)

[Issues] [Add an option to specify properties prefix](https://github.com/FasterXML/jackson-dataformats-text/issues/100)