---
layout:     post
title:      Hyperledger Fabric (七) — Fabric添加CA
date:       2019-02-26 12:00:00
author:     "banban"
header-img: "/images/blockchain/hyperledger/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Hyperledger
    - Fabric
---

`CA`是`fabric`网络中进行证书、密钥发放的服务，一般是只暴露在内部网络中，对应组织一般维持自己的`ca`节点，它提供了如下特性：
- 登记身份（注册ID），或者连接到作为用户注册表的LDAP（LDAP是轻量目录访问协议，英文全称是Lightweight Directory Access Protocol，一般都简称为LDAP。它是基于X.500标准的，但是简单多了并且可以根据需要定制）。
- 签发背书证书（Enrollment Certificates——ECerts）
- 证书更新和撤销

下面的图表说明了如何将Hyperledger Fabric CA与总体的Hyperledger Fabric结构相匹配。
![image](/images/blockchain/hyperledger/fabric-ca.png)

有两种方式与一种`Hyperledger Fabric CA`服务器进行交互：通过`Hyperledger Fabric CA`的客户端或通过任意一种Fabric的SDKs。所有与`Hyperledger Fabric CA`服务器的通信都是通过REST api进行的。有关这些REST api的swagger文档，请参见`fabric-ca/swagger/swagger-fabric-ca.json`

`Hyperledger Fabric CA`客户端或SDK可以连接到一个`Hyperledger Fabric CA`服务器集群中的服务器。这在图的右上角说明了这一点。客户端路由到一个HA代理，该代理将流量负载平衡到一个`fabric-ca-server`集群成员。

在集群中，所有的Hyperledger Fabric CA的服务器都共享相同的数据库，以跟踪身份和证书。如果配置了LDAP，则将标识信息保存在LDAP中而不是数据库中。

一个服务器可能包含多个CAs。每个CA要么是根CA，要么是中间CA。每个中间CA都有一个父CA，它要么是根CA，要么是另一个中间CA。

## 添加CA
建立在`first-network`的基础上，直接修改`docker-compose-cli.yaml`文件，内容如下
```
version: '2'

volumes:
  orderer.example.com:
  peer0.org1.example.com:
  peer1.org1.example.com:
  peer0.org2.example.com:
  peer1.org2.example.com:

networks:
  byfn:
services:
  ca0:
    image: hyperledger/fabric-ca:$IMAGE_TAG
    environment:
      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca-org1
      - FABRIC_CA_SERVER_TLS_ENABLED=false
      - FABRIC_CA_SERVER_TLS_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem
      - FABRIC_CA_SERVER_TLS_KEYFILE=/etc/hyperledger/fabric-ca-server-config/cbbfce681965452edda8e7b5239869b217020407f112bc1931922c395d25d793_sk
    ports:
      - "7054:7054"
    command: sh -c 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/cbbfce681965452edda8e7b5239869b217020407f112bc1931922c395d25d793_sk -b admin:adminpw -d'
    volumes:
      - ./crypto-config/peerOrganizations/org1.example.com/ca/:/etc/hyperledger/fabric-ca-server-config
    container_name: ca_peerOrg1
    networks:
      - byfn

  ca1:
    image: hyperledger/fabric-ca:$IMAGE_TAG
    environment:
      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca-org2
      - FABRIC_CA_SERVER_TLS_ENABLED=false
      - FABRIC_CA_SERVER_TLS_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.org2.example.com-cert.pem
      - FABRIC_CA_SERVER_TLS_KEYFILE=/etc/hyperledger/fabric-ca-server-config/e93d4b78f812ef70ba755e88bf01effcd6bec850bcc985884841d162c523b342_sk
    ports:
      - "8054:7054"
    command: sh -c 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca.org2.example.com-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/e93d4b78f812ef70ba755e88bf01effcd6bec850bcc985884841d162c523b342_sk -b admin:adminpw -d'
    volumes:
      - ./crypto-config/peerOrganizations/org2.example.com/ca/:/etc/hyperledger/fabric-ca-server-config
    container_name: ca_peerOrg2
    networks:
      - byfn

  orderer.example.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer.example.com
    container_name: orderer.example.com
    networks:
      - byfn

  peer0.org1.example.com:
    container_name: peer0.org1.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org1.example.com
    networks:
      - byfn

  peer1.org1.example.com:
    container_name: peer1.org1.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org1.example.com
    networks:
      - byfn

  peer0.org2.example.com:
    container_name: peer0.org2.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org2.example.com
    networks:
      - byfn

  peer1.org2.example.com:
    container_name: peer1.org2.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org2.example.com
    networks:
      - byfn
  
  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      # - CORE_LOGGING_LEVEL=DEBUG
      - CORE_LOGGING_LEVEL=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=false
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./../chaincode/:/opt/gopath/src/github.com/chaincode
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
        - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
        - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - orderer.example.com
      - peer0.org1.example.com
      - peer1.org1.example.com
      - peer0.org2.example.com
      - peer1.org2.example.com
    networks:
      - byfn
```
这个配置中，添加了两个`ca`，同时要注意ca启动的过程中需要读取外部的证书和私钥文件，需要根据启动网络中生成的`crypto-config`目录中的文件进行替换修改两个`FABRIC_CA_SERVER_TLS_KEYFILE`值。

⚠️注意⚠️：这里的配置项`CORE_PEER_TLS_ENABLED`都是`false`，那么在`first-network`目录下的`base`目录中的两个配置文件也需要对应配置`TLS`。

这样之后通过`docker-compose`启动即可。

## 使用fabric-sdk-java调用
在`fabric-sdk-java`中，对应擦操作`CA`部分的`client`是`HFCAClient`
```
HFCAClient ca = HFCAClient.createNewInstance(caLocation, properties);
ca.setCryptoSuite(CryptoSuite.Factory.getCryptoSuite());
```
`ca`对应由`enroll`、`register`方法能够注册和登记用户。

具体可以参考github：https://github.com/banbanpeppa/fabric-samples
