---
layout:     post
title:      Hyperledger Fabric (五) — Fabric更新配置
date:       2018-11-06 12:00:00
author:     "banban"
header-img: "/images/blockchain/hyperledger/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Hyperledger
    - Fabric
---

# Fabric更新频道配置

## 什么是channel配置
channel配置包含了所有管理channel的配置信息，同时也说明了对应channel的成员有哪些、访问的权限控制、区块大小配置等内容，这些配置信息都会存储在区块链上，被称为配置区块，第一个配置区块被称为`genesis block`， 它包含了Fabric网络启动的所有基本配置。而在之后的区块链更新中，所有的排序节点和`peer`节点都在自己的内存中保存了最新的配置区块内容，这样才能够保证产生的区块的合法性和正确可靠性。

## 更新channel配置示例

频道是高度可配置的，但是也不是没有限制的，不同的配置项有不同的配置规则，在Fabric网络中一般是将二进制格式的pb文件转化为JSON格式，方便修改配置，然后再转化为二进制文件，交给不同的组织锚节点进行签名，最后打包好发送给排序节点进行排序，使得配置生效。在Fabric中，区块一般是分为普通区块和配置区块，创世块就是一个配置区块。

在《Fabric添加Org》一文中有提到如何通过提交更新配置区块来添加`org3`，其实更新`channel`的配置工作大致也就是这些工作。

首先介绍一下Fabric网络中几个常用配置项。

- *Batch Size* 这个参数主要表示一个区块里面包含的交易数目和交易的大小，所有的区块都不会超过配置项`absolute_max_bytes`，同时交易的数量也不会超过配置项`max_message_count`，如果说在打包交易的过程中能够满足将区块打包大小在`preferred_max_bytes`以内，则在打包区块前会提前进行修剪区块里面的交易，超过这个大小限制的交易会放置在后续的区块中打包。这个配置项内容如下
	```
	{
	  "absolute_max_bytes": 102760448,
	  "max_message_count": 10,
	  "preferred_max_bytes": 524288
	}
	```

- *Batch Timeout* 该配置主要用于配置批处理超时，在创建批处理之前的等待时间，超过这个时间的交易将放置到后续区块打包。这个配置项主要用于配置吞吐量，对于即时性要求比较高的联盟来说可以将这个配置降低，这样响应一个区块的时间会提升，但是同时也会降低一定的吞吐量，因为一次打包的交易量因为时间原因会变少。这个配置要视需求而定，配置项
	```
	{ "timeout": "2s" }
	```

- *Channel Restrictions* 一个Orderer节点会分配的最大频道数目。
	```
	{
	 "max_count":1000
	}
	```

- *Channel Creation Policy* 定义了频道创建的规则，这个配置只能在排序节点中的`channel`中进行配置。
	```
	{
	"type": 3,
	"value": {
	  "rule": "ANY",
	  "sub_policy": "Admins"
	  }
	}
	```

- *Kafka brokers* 当一致性类型`ConsensusType`设置为`kafka`的时候需要设置该配置，但是这边需要注意当初始区块已经设置了该配置之后，后续是没有办法修改的。
	```
	{
	  "brokers": [
	    "kafka0:9092",
	    "kafka1:9092",
	    "kafka2:9092",
	    "kafka3:9092"
	  ]
	}
	```

- *Anchor Peers Definition* 定义每个Org的锚节点的位置。
	```
	{
	  "host": "peer0.org2.example.com",
	    "port": 7051
	}
	```

- *Hashing Structure* 配置每个区块通过`Merkle`树格式构建之后得到的`hash`值。具体感兴趣可以看`hash`算法。
	```
	{ "width": 4294967295 }
	```

- *Hashing Algorithm* 配置区块`hash`的算法
	```
	{ "name": "SHA256" }
	```

- *Block Validation* 这个配置指明区块确认过程中需要哪些签名，默认需要获得来自一些排序组织的成员的签名。
	```
	{
	  "type": 3,
	  "value": {
	    "rule": "ANY",
	    "sub_policy": "Writers"
	  }
	}
	```

- *Orderer Address* 一个排序节点的列表，客户端可以通过这个配置找到对应的排序节点来获得对应的配置信息和区块信息.
	```
	{
	  "addresses": [
	    "orderer.example.com:7050"
	  ]
	}
	```

### 修改batch-size配置

接下来修改batch size。还是以`first-network`网络为例子，如果没有构建`first-network`，可以参考《超级账本使用fabric-sample》一文。

进入到`cli`容器
```
docker exec -it cli bash
```

配置环境变量
```
export CHANNEL_NAME=mychannel && \
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

获取目前的配置信息
```
peer channel fetch config config_block.pb -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
```

将获得的二进制配置文件转化为json，并且去除对应的头部信息
```
configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json
```

将batch-size的属性路径配置到环境变量中
```
export MAXBATCHSIZEPATH=".channel_group.groups.Orderer.values.BatchSize.value.max_message_count"
```

查看当前的batch-size的配置值
```
jq "$MAXBATCHSIZEPATH" config.json

10
```

接下来就修改这个值为20
```
jq "$MAXBATCHSIZEPATH = 20" config.json > modified_config.json
```

查看修改后的值
```
jq "$MAXBATCHSIZEPATH" modified_config.json

20
```

接下来将`config.json`文件转换为二进制`protobuf`文件
```
configtxlator proto_encode --input config.json --type common.Config --output config.pb
```

然后将`modified_config.jso`文件转化为`protobuf`二进制文件
```
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
```

使用`configtxlator`工具计算出两个配置文件的差异，得到一个新的用于更新组织结构的`protobuf`二进制文件
```
configtxlator compute_update --channel_id mychannel --original config.pb --updated modified_config.pb --output batch_size_update.pb
```

查看处理之后的`json`格式信息
```
configtxlator proto_decode --input batch_size_update.pb  --type common.ConfigUpdate

{
  "channel_id": "mychannel",
  "read_set": {
    "groups": {
      "Orderer": {
        "mod_policy": "",
        "version": "0"
      }
    },
    "mod_policy": "",
    "version": "0"
  },
  "write_set": {
    "groups": {
      "Orderer": {
        "mod_policy": "",
        "values": {
          "BatchSize": {
            "mod_policy": "Admins",
            "value": {
              "absolute_max_bytes": 103809024,
              "max_message_count": 20,
              "preferred_max_bytes": 524288
            },
            "version": "1"
          }
        },
        "version": "0"
      }
    },
    "mod_policy": "",
    "version": "0"
  }
}
```


将计算求得的差异二进制文件转化为JSON格式文件
```
configtxlator proto_decode --input batch_size_update.pb --type common.ConfigUpdate | jq . > batch_size_update.json
```

包装成更新配置的信封
```
echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat batch_size_update.json)'}}}' | jq . > batch_size_update_in_envelope.json
```
得到信封
```
cat batch_size_update_in_envelope.json

{
  "payload": {
    "header": {
      "channel_header": {
        "channel_id": "mychannel",
        "type": 2
      }
    },
    "data": {
      "config_update": {
        "channel_id": "mychannel",
        "read_set": {
          "groups": {
            "Orderer": {
              "mod_policy": "",
              "version": "0"
            }
          },
          "mod_policy": "",
          "version": "0"
        },
        "write_set": {
          "groups": {
            "Orderer": {
              "mod_policy": "",
              "values": {
                "BatchSize": {
                  "mod_policy": "Admins",
                  "value": {
                    "absolute_max_bytes": 103809024,
                    "max_message_count": 20,
                    "preferred_max_bytes": 524288
                  },
                  "version": "1"
                }
              },
              "version": "0"
            }
          },
          "mod_policy": "",
          "version": "0"
        }
      }
    }
  }
}
```

将信封转化为二进制文件
```
configtxlator proto_encode --input batch_size_update_in_envelope.json --type common.Envelope --output batch_size_update_in_envelope.pb
```

### 签名信封文件并提交更新

需要注意的是，目前更新的内容是`Orderer`模块的配置内容，因此这个更新必须是获得`orderer`节点中的`Admin`的签名，Fabric规定的是需要获得大多数的排序节点的签名，默认是需要1个以上。

如果我们用和添加组织一样的方式，使用多个组织的Admin对这个信封进行签名，最后提交更新交易的时候会发生如下错误

```
2018-11-06 08:42:43.761 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
Error: got unexpected status: BAD_REQUEST -- error authorizing update: error validating DeltaSet: policy for [Value]  /Channel/Orderer/BatchSize not satisfied: Failed to reach implicit threshold of 1 sub-policies, required 1 remaining
```
这个错误的解决可[参考](https://lists.hyperledger.org/g/fabric/topic/error_executing_peer_channel/17549272?p=,,,20,0,0,0::recentpostdate%2Fsticky,,,20,1,460,17549272)，也就是使用`orderer`节点进行签名，如下
```
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/users/Admin\@example.com/msp \
CORE_PEER_LOCALMSPID=OrdererMSP \
peer channel update -f batch_size_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.example.com:7050 --tls --cafile $ORDERER_CA

2018-11-06 08:49:53.026 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-11-06 08:49:53.038 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update
```
检查是否更新配置成功
```
peer channel fetch config check_config_block.pb -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA && \
configtxlator proto_decode --input check_config_block.pb --type common.Block | jq .data.data[0].payload.data.config.channel_group.groups.Orderer.values.BatchSize.value.max_message_count

2018-11-06 09:15:02.905 UTC [cli/common] readBlock -> INFO 002 Received block: 5
2018-11-06 09:15:02.906 UTC [cli/common] readBlock -> INFO 003 Received block: 5
20
```
会看到配置已经变成20了，说明配置更新成功！

## 获得必要的签名

当获得对应的二进制配置更新信封之后，需要适当地进行签名，而不同的配置需要不同的签名要求。一下列出不同的签名要求

### A particular org 
这个只需要得到这个组织的Admin签名即可。例如，修改锚节点:
```
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" \
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org2MSPanchors.tx --tls \
--cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

### The application
需要大部分的组织中的Admin的签名，例如现在有一个添加节点的配置更新的二进制信封`org4_update_in_envelope.pb`，首先是`org1`的锚节点签名信封`org4_update_in_envelope.pb`
```
peer channel signconfigtx -f org4_update_in_envelope.pb

2018-11-06 08:11:49.103 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
```

接下来是`org2`为信封签名
```
CORE_PEER_LOCALMSPID="Org2MSP" && \
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt && \
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp && \
CORE_PEER_ADDRESS=peer0.org2.example.com:7051 \
peer channel signconfigtx -f org4_update_in_envelope.pb

2018-11-06 08:12:56.437 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
```

如果有`org3`则让`org3`为信封签名，以此类推，由于`org3cli`容器里面才有这个组织对应的证书文件和密钥文件，因此需要进入到`org3cli`容器中进行操作，首先将`cli`容器里面的二进制信封复制到`channel-artifacts`中
```
cp org4_update_in_envelope.pb channel-artifacts/
```
进入到宿主机器中的`$FABRIC_SAMPLE=$GOPATH/src/github.com/hyperledger/fabric-samples/first-network`中
```
cp channel-artifacts/org4_update_in_envelope.pb org3-artifacts/crypto-config/
```

进入到`org3cli`容器中
```
docker exec -it Org3cli bash
```
然后执行
```
peer channel signconfigtx -f org4_update_in_envelope.pb
```

最后在`orgcli3`中提交配置更新信息到排序节点
```
export CHANNEL_NAME=mychannel && \
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem && \
peer channel update -f org4_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.example.com:7050 --tls --cafile $ORDERER_CA
```

### The orderer

这个情况需要获得绝大多数的排序节点的Admin的签名，之前的示例就是这种情况

### The top level channel group

这是最高层的配置更新，需要获得绝大多数的组织Admin签名和绝大多数的排序节点的Admin签名。

## 结

配置更新只要针对当前的区块配置文件进行修改即可，使用`configtxlator`工具进行转化，得到最终需要提交的二进制文件。之后签名的时候需要注意不同的签名有不同的签名要求。