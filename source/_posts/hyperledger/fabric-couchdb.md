---
layout:     post
title:      CouchDB替换Fabric-LevelDB
date:       2018-10-30 09:51:00
author:     "banban"
header-img: "/images/blockchain/hyperledger/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Hyperledger
    - Fabric
---

## CouchDB
`CouchDB`是一种`NoSQL`解决方案。它是一个面向文档的数据库，其中文档字段存储为键值映射。字段可以是简单的键值对，列表或映射。除了`LevelDB`支持的键值查询/复合键查询/范围查询外，`CouchDB`还支持数据的完全查询功能，例如对整个区块链数据的非键值查询，因为`CouchDB`的数据是以`JSON`存储的，所以可以实现完全查询。`CouchDB`可以支持许多`LevelDB`不支持的链码审计、报告的要求。

`CouchDB`还可以增强区块链中的合规性和数据保护的安全性。因为它能够通过过滤和屏蔽事务中的各个属性来实现字段级安全性，并且只在需要时授权只读权限。

此外，`CouchDB`属于`CAP`定理的`AP`类型（可用性和分区容差）。它使用`master-master`高可用模型。在每一个`fabric`节点中，不会有数据库的副本，因此写入到数据库操作需要确保一致性和持久性，它是不能确保最终一致性的数据库。

`CouchDB`是`Fabric`的第一个外部可插拔的状态数据库，未来会支持更多的数据库。IBM内部支持了关系型数据库。同时在某些场景下也需要一些能够支持`C-P`类型的（一致性、分区容忍性）的数据！

## 替换LevelDB
`first-network`网络默认使用的数据库方案是`go-leveldb`，替换为`CouchDB`。`CouchDB`除了能支持`leveldb`的方法，还能实现丰富而又复杂的查询，数据库的序列化采用`JSON`。

首先清理原有网络
```
echo y | ./byfn.sh down

docker rm -f $(docker ps -aq)
```

接下来需要首先生成证书等，由于`byfn.sh`脚本更加方便，我们直接使用它
```
echo y | ./byfn.sh -m generate
```

启动网络
```
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml up -d
```
启动网络之后看到网络中添加了`couchdb`的容器
```
docker ps -a

CONTAINER ID        IMAGE                               COMMAND                  CREATED                            PORTS                                         NAMES
60285f9fcf93        hyperledger/fabric-tools:latest     "/bin/bash"              About a minute ago                                                         cli
0e50ff0569b3        hyperledger/fabric-peer:latest      "peer node start"        About a minute ago      0.0.0.0:8051->7051/tcp, 0.0.0.0:8053->7053/tcp     peer1.org1.example.com
fded9f702e7b        hyperledger/fabric-peer:latest      "peer node start"        About a minute ago      0.0.0.0:9051->7051/tcp, 0.0.0.0:9053->7053/tcp     peer0.org2.example.com
31f3134bfce3        hyperledger/fabric-peer:latest      "peer node start"        About a minute ago      0.0.0.0:10051->7051/tcp, 0.0.0.0:10053->7053/tcp   peer1.org2.example.com
6c11075f9d35        hyperledger/fabric-peer:latest      "peer node start"        About a minute ago      0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp     peer0.org1.example.com
c78e46e749f6        hyperledger/fabric-couchdb          "tini -- /docker-e..."   2 minutes ago           4369/tcp, 9100/tcp, 0.0.0.0:8984->5984/tcp         couchdb3
a29280255587        hyperledger/fabric-couchdb          "tini -- /docker-e..."   2 minutes ago           4369/tcp, 9100/tcp, 0.0.0.0:6984->5984/tcp         couchdb1
a93bd7270c34        hyperledger/fabric-orderer:latest   "orderer"                2 minutes ago           0.0.0.0:7050->7050/tcp                             orderer.example.com
38f0b7d00e47        hyperledger/fabric-couchdb          "tini -- /docker-e..."   2 minutes ago           4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp         couchdb0
b9870083a99a        hyperledger/fabric-couchdb          "tini -- /docker-e..."   2 minutes ago           4369/tcp, 9100/tcp, 0.0.0.0:7984->5984/tcp         couchdb2
```

就是在启动的时候添加了`docker-compose-couch.yaml`的描述文件

进入到`cli`容器中
```
docker exec -it cli bash
```

创建`channel`
```
export CHANNEL_NAME=mychannel && peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx \
--tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

2018-10-30 02:27:21.940 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-10-30 02:27:22.013 UTC [cli/common] readBlock -> INFO 002 Received block: 0
```
将节点`peer0.org1.example.com`和`peer0.org2.example.com`分别加入到`channel`中

`peer0.org1.example.com`
```
peer channel join -b mychannel.block

2018-10-30 02:27:47.240 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-10-30 02:27:47.488 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```

`peer0.org2.example.com`
```
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" \
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
peer channel join -b mychannel.block

2018-10-30 02:28:03.189 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-10-30 02:28:03.433 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```
指定锚节点
`peer0.org1.example.com`
```
peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org1MSPanchors.tx --tls \
--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

`peer0.org2.example.com`
```
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" \
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org2MSPanchors.tx --tls \
--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

查看是否有安装链码
```
peer chaincode list --installed

Get installed chaincodes on peer:
```

目前没有任何链码安装好，接下来我们使用`github.com/chaincode/marbles02/go`中的`marbles_chaincode.go`链码。

### marbles_chaincode.go

执行
```
peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/marbles02/go
```
实例化链码
```
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -v 1.0 -c '{"Args":["init"]}' -P "OR ('Org0MSP.peer','Org1MSP.peer')"
```

创建一些`marbles`
```
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -c '{"Args":["initMarble","marble1","blue","35","tom"]}' && \
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -c '{"Args":["initMarble","marble2","red","50","tom"]}' && \
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -c '{"Args":["initMarble","marble3","blue","70","tom"]}' && \
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -c '{"Args":["transferMarble","marble2","jerry"]}' && \
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -c '{"Args":["transferMarblesBasedOnColor","blue","jerry"]}' && \
peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n marbles -c '{"Args":["delete","marble1"]}'
```

在`docker-compose`描述文件`docker-compose-couch.yaml`文件中
```
services:
  couchdb0:
    container_name: couchdb0
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
```
指明了`couchdb`容器对应的端口映射，因此我们可以通过外部网络访问`couchdb`的`web`接口`Fauxton`，但是这个操作在生产环境中是不建议的，会出现安全问题
`http://localhost:5984/_util`
![image](/images/blockchain/hyperledger/fabric-couchdb.png)

查询`marble2`
```
peer chaincode query -C $CHANNEL_NAME -n marbles -c '{"Args":["readMarble","marble2"]}'

{
  "color": "red",
  "docType": "marble",
  "name": "marble2",
  "owner": "jerry",
  "size": 50
}
```

查询`marble1`的历史记录
```
peer chaincode query -C $CHANNEL_NAME -n marbles -c '{"Args":["getHistoryForMarble","marble1"]}'

[
  {
    "TxId": "d351f7c4f61e669cc0f254844a268b015941241d6aaf63981bad090ab064761d",
    "Value": {
      "docType": "marble",
      "name": "marble1",
      "color": "blue",
      "size": 35,
      "owner": "tom"
    },
    "Timestamp": "2018-10-30 06:18:52.643796107 +0000 UTC",
    "IsDelete": "false"
  },
  {
    "TxId": "0411b642b0db5bd8075260f980ac977e6da066188b59f833d5ff8aba8cdb6abb",
    "Value": {
      "docType": "marble",
      "name": "marble1",
      "color": "blue",
      "size": 35,
      "owner": "jerry"
    },
    "Timestamp": "2018-10-30 06:19:23.043823665 +0000 UTC",
    "IsDelete": "false"
  },
  {
    "TxId": "f94737b23a19215be035d651fa470b3a8e8dfd2c5b6c7bb54d72c3242d50ced6",
    "Value": null,
    "Timestamp": "2018-10-30 06:19:28.865157343 +0000 UTC",
    "IsDelete": "true"
  },
  {
    "TxId": "e131b63ce74e964b9cbc95ac0bdb5bd45ef2d412e46953499ea2d1ab2d847560",
    "Value": {
      "docType": "marble",
      "name": "marble1",
      "color": "blue",
      "size": 35,
      "owner": "tom"
    },
    "Timestamp": "2018-10-30 06:46:10.905922106 +0000 UTC",
    "IsDelete": "false"
  }
]
```

同样还可以根据作者查询`marble`
```
peer chaincode query -C $CHANNEL_NAME -n marbles -c '{"Args":["queryMarblesByOwner","jerry"]}'

[
  {
    "Key": "marble2",
    "Record": {
      "color": "red",
      "docType": "marble",
      "name": "marble2",
      "owner": "jerry",
      "size": 50
    }
  },
  {
    "Key": "marble3",
    "Record": {
      "color": "blue",
      "docType": "marble",
      "name": "marble3",
      "owner": "jerry",
      "size": 70
    }
  }
]
```

## 结

`CouchDB`能够带来更加丰富的查询操作，相比于`LevelDB`来说更加适合作为`Fabric`底层的数据库。