---
layout:     post
title:      Fabric添加Org
author:     "banban"
header-img: "/images/blockchain/hyperledger/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Hyperledger
    - Fabric
---

## 脚本添加Org
添加一个`Org`到`first-network`网络中，官方提供了一个`eyfn.sh`脚本，`eyfn`意为`Extending Your First Network`。添加Org的过程很方便
```
echo y | ./byfn.sh down
echo y | ./byfn.sh generate
echo y | ./byfn.sh up
echo y | ./eyfn.sh up
```

执行完成之后
```
docker ps -a

CONTAINER ID        IMAGE                                       PORTS                                                      NAMES
b16edd07769b        dev-peer0.org2.example.com-mycc-2.0-c7aee9ad18dddc18319f5f00199f05d866f9e61dca40c9af3e226d434ac4a63c       dev-peer0.org2.example.com-mycc-2.0
0ded8b49c160        dev-peer0.org3.example.com-mycc-2.0-156223788c3ef42ff3094c6cf1d2f71284c36f2074cc4d1f09a7065cb903d192       dev-peer0.org3.example.com-mycc-2.0
202a09c6b3d1        dev-peer0.org1.example.com-mycc-2.0-2732cd4d96a0b88594aefca15581eaa0fb481ad15beeb86cc79931b2a90ee621       dev-peer0.org1.example.com-mycc-2.0
6c0572ac8646        hyperledger/fabric-tools:latest                                                                Org3cli
5ce62cc58a1a        hyperledger/fabric-peer:latest              0.0.0.0:11051->7051/tcp, 0.0.0.0:11053->7053/tcp   peer0.org3.example.com
b10e64ea4d33        hyperledger/fabric-peer:latest              0.0.0.0:12051->7051/tcp, 0.0.0.0:12053->7053/tcp   peer1.org3.example.com
ce64075e99bc        dev-peer1.org2.example.com-mycc-1.0-26c2ef32838554aac4f7ad6f100aca865e87959c9a126e86d764c8d01f8346ab       dev-peer1.org2.example.com-mycc-1.0
d826287326db        dev-peer0.org1.example.com-mycc-1.0-384f11f484b9302df90b453200cfb25174305fce8f53f4e94d45ee3b6cab0ce9       dev-peer0.org1.example.com-mycc-1.0
ad0f7383a1af        dev-peer0.org2.example.com-mycc-1.0-15b571b3ce849066b7ec74497da3b27e54e0df1345daff3951b94245ce09c42b       dev-peer0.org2.example.com-mycc-1.0
984f8fed77ed        hyperledger/fabric-tools:latest                                                                cli
0e944a79c929        hyperledger/fabric-peer:latest              0.0.0.0:8051->7051/tcp, 0.0.0.0:8053->7053/tcp     peer1.org1.example.com
b176ea926c3e        hyperledger/fabric-peer:latest              0.0.0.0:9051->7051/tcp, 0.0.0.0:9053->7053/tcp     peer0.org2.example.com
174543ea3455        hyperledger/fabric-peer:latest              0.0.0.0:10051->7051/tcp, 0.0.0.0:10053->7053/tcp   peer1.org2.example.com
f4ed208868d7        hyperledger/fabric-peer:latest              0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp     peer0.org1.example.com
eb245da30739        hyperledger/fabric-orderer:latest           0.0.0.0:7050->7050/tcp                             orderer.example.com
```

看到多了一个组织`org3`，两个`peer`节点：`peer0.org3.example.com`、`peer1.org3.example.com`，一个`cli`容器`Org3cli`，一个`dev`容器`dev-peer0.org3.example.com-mycc-2.0`。

进入到容器`Org3cli`

```
docker exec -it Org3cli bash
```

查询`channel`
```
peer channel list

2018-10-30 10:56:09.995 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
Channels peers has joined: 
mychannel
```
查询安装好的链码
```
peer chaincode list --installed

Get installed chaincodes on peer:
Name: mycc, Version: 2.0, Path: github.com/chaincode/chaincode_example02/go/, Id: 46c85746ea21c801decec963f4b6b8787fa379ce1d7c536a19a4a97a49ada9ed
```
查询已经实例化的链码
```
peer chaincode list --instantiated -C mychannel

Get instantiated chaincodes on channel mychannel:
Name: mycc, Version: 2.0, Path: github.com/chaincode/chaincode_example02/go/, Escc: escc, Vscc: vscc
```
查询账本
```
peer chaincode query -n mycc -C mychannel -c '{"Args":["query", "a"]}' 

80
```
执行invoke
```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem && \
export CHANNEL_NAME=mychannel && \
peer chaincode invoke -o orderer.example.com:7050  --tls true --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","10"]}'

2018-10-30 11:38:26.218 UTC [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 
```
这条命令虽然返回了执行成功的代码，但是却没有生效，通过查看各个节点的日志
```
2018-11-02 02:25:29.114 UTC [gossip/privdata] StoreBlock -> INFO 071 [mychannel] Received block [8] from buffer
2018-11-02 02:25:29.114 UTC [vscc] Validate -> WARN 072 Endorsement policy failure for transaction txid=fadbd9afe70a407c16b78bdb06cb6f3947b0e368e570e812fdbd4ad33723cd66, err: signature set did not satisfy policy
2018-11-02 02:25:29.115 UTC [committer/txvalidator] validateTx -> ERRO 073 VSCCValidateTx for transaction txId = fadbd9afe70a407c16b78bdb06cb6f3947b0e368e570e812fdbd4ad33723cd66 returned error: VSCC error: endorsement policy failure, err: signature set did not satisfy policy
2018-11-02 02:25:29.115 UTC [committer/txvalidator] Validate -> INFO 074 [mychannel] Validated block [8] in 0ms
2018-11-02 02:25:29.115 UTC [valimpl] preprocessProtoBlock -> WARN 075 Channel [mychannel]: Block [8] Transaction index [0] TxId [fadbd9afe70a407c16b78bdb06cb6f3947b0e368e570e812fdbd4ad33723cd66] marked as invalid by committer. Reason code [ENDORSEMENT_POLICY_FAILURE]
2018-11-02 02:25:29.142 UTC [kvledger] CommitWithPvtData -> INFO 076 [mychannel] Committed block [8] with 1 transaction(s) in 27ms (state_validation=0ms block_commit=20ms state_commit=2ms)
```
会发现错误内容`err: signature set did not satisfy policy`，应该是签名没有成功的原因，这个问题经过验证，手动添加Org过程不会出现，应该是`eyfn.sh`脚本里面存在一些问题。

## 手动添加Org

手动配置添加`org`基于`first-network`基础上，则删除环境之后重启网络
```
echo y | ./eyfn.sh down
echo y | ./byfn.sh generate
echo y | ./byfn.sh up
```

### 生成Org3需要的加密材料
进入到`org3-artifacts`中
```
cd org3-artifacts && ls -a

.  ..  configtx.yaml  org3-crypto.yaml
```

`configtx.yaml`
```
Organizations:
    - &Org3
        # DefaultOrg defines the organization which is used in the sampleconfig
        # of the fabric.git development environment
        Name: Org3MSP

        # ID to load the MSP definition as
        ID: Org3MSP

        MSPDir: crypto-config/peerOrganizations/org3.example.com/msp

        AnchorPeers:
            # AnchorPeers defines the location of peers which can be used
            # for cross org gossip communication.  Note, this value is only
            # encoded in the genesis block in the Application section context
            - Host: peer0.org3.example.com
              Port: 7051
```

`org3-crypto.yaml`
```
PeerOrgs:
  # ---------------------------------------------------------------------------
  # Org3
  # ---------------------------------------------------------------------------
  - Name: Org3
    Domain: org3.example.com
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
```

使用`org3-crypto.yaml`描述文件生成`org3`需要的证书和密钥
```
cryptogen generate --config=./org3-crypto.yaml
```
会在`org3-artifacts`目录下会生成一个`crypto-config`目录
```
ls crypto-config

peerOrganizations
```

会看到`org3`的证书和密钥目录
```
tree crypto-config/peerOrganizations

crypto-config/peerOrganizations
└── org3.example.com
    ├── ca
    │   ├── 0b65ed62cb975a49000d691f3e3bc377a6e40d9e175286b2ff57c86ce3379cc7_sk
    │   └── ca.org3.example.com-cert.pem
    ├── msp
    │   ├── admincerts
    │   │   └── Admin@org3.example.com-cert.pem
    │   ├── cacerts
    │   │   └── ca.org3.example.com-cert.pem
    │   ├── config.yaml
    │   └── tlscacerts
    │       └── tlsca.org3.example.com-cert.pem
    ├── peers
    │   ├── peer0.org3.example.com
    │   │   ├── msp
    │   │   │   ├── admincerts
    │   │   │   │   └── Admin@org3.example.com-cert.pem
    │   │   │   ├── cacerts
    │   │   │   │   └── ca.org3.example.com-cert.pem
    │   │   │   ├── config.yaml
    │   │   │   ├── keystore
    │   │   │   │   └── 3ecc6f20267c176e5393e3df720e76b9513463735c7be2c614980f163abe4490_sk
    │   │   │   ├── signcerts
    │   │   │   │   └── peer0.org3.example.com-cert.pem
    │   │   │   └── tlscacerts
    │   │   │       └── tlsca.org3.example.com-cert.pem
    │   │   └── tls
    │   │       ├── ca.crt
    │   │       ├── server.crt
    │   │       └── server.key
    │   └── peer1.org3.example.com
    │       ├── msp
    │       │   ├── admincerts
    │       │   │   └── Admin@org3.example.com-cert.pem
    │       │   ├── cacerts
    │       │   │   └── ca.org3.example.com-cert.pem
    │       │   ├── config.yaml
    │       │   ├── keystore
    │       │   │   └── 03646845d34d148fc7191223f341c24a79415e639044c1a1a6868a6e0619775d_sk
    │       │   ├── signcerts
    │       │   │   └── peer1.org3.example.com-cert.pem
    │       │   └── tlscacerts
    │       │       └── tlsca.org3.example.com-cert.pem
    │       └── tls
    │           ├── ca.crt
    │           ├── server.crt
    │           └── server.key
    ├── tlsca
    │   ├── 6848091b60c9faff95db6d57cf834c7fc4fbc189402cae984311fc677573b331_sk
    │   └── tlsca.org3.example.com-cert.pem
    └── users
        ├── Admin@org3.example.com
        │   ├── msp
        │   │   ├── admincerts
        │   │   │   └── Admin@org3.example.com-cert.pem
        │   │   ├── cacerts
        │   │   │   └── ca.org3.example.com-cert.pem
        │   │   ├── keystore
        │   │   │   └── 670b28e90f29cc2641e98271617c0dcd094e0f1ad90e2d5e76efdd5e366212ac_sk
        │   │   ├── signcerts
        │   │   │   └── Admin@org3.example.com-cert.pem
        │   │   └── tlscacerts
        │   │       └── tlsca.org3.example.com-cert.pem
        │   └── tls
        │       ├── ca.crt
        │       ├── client.crt
        │       └── client.key
        └── User1@org3.example.com
            ├── msp
            │   ├── admincerts
            │   │   └── User1@org3.example.com-cert.pem
            │   ├── cacerts
            │   │   └── ca.org3.example.com-cert.pem
            │   ├── keystore
            │   │   └── 6e50f123c27d6ef32d8663f2acc4224988b31d50843da3e3a03d0492aed0e1ce_sk
            │   ├── signcerts
            │   │   └── User1@org3.example.com-cert.pem
            │   └── tlscacerts
            │       └── tlsca.org3.example.com-cert.pem
            └── tls
                ├── ca.crt
                ├── client.crt
                └── client.key
```

使用`configtxgen`工具将`org3`的配置信息以JSON的形式保存到`first-network`目录下的`channel-artifacts`中，这里需要将对应的环境变量`FABRIC_CFG_PATH`改成`configtx.yaml`所在目录
```
export FABRIC_CFG_PATH=$PWD && configtxgen -printOrg Org3MSP > ../channel-artifacts/org3.json
```

在`first-network`手动启动网络的部分，我们是将对应的配置输出到`genesis.block`文件中，这个文件是一个二进制文件，注意区别
> configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block 

创建好的`org3.json`文件包含了`Org3`的策略，以及三个`base64`的证书：`admin`用户的证书（之后要给`Org3`的`admin`角色使用）、`CA` 根证书、`TLS` 根证书。为什么需要以`json`格式文件导出呢？因为后面需要将`org3`配置信息追加到`channel`的配置信息中也就是`genesis.block`中

接下来很重要的是需要将排序节点证书信息放到`org3`的`crypto-config`中，对应排序节点的根证书给了`org3`才能使得`org3`和网络的排序节点进行完全通讯

```
cd ../ && cp -r crypto-config/ordererOrganizations org3-artifacts/crypto-config/
```

### 准备CLI环境

更新组织的过程中会使用到一个配置翻译工具`configtxlator`，这个工具能够通过命令的方式简化配置工作，这个工具可以很方便进行配置文件的等价转换，转化为类似JSON/Protobuf的格式。同时这个工具还能够计算两个配置文件之间的差异
```
$ configtxlator --help

usage: configtxlator [<flags>] <command> [<args> ...]

Utility for generating Hyperledger Fabric channel configurations

Flags:
  --help  Show context-sensitive help (also try --help-long and --help-man).

Commands:
  help [<command>...]
    Show help.

  start [<flags>]
    Start the configtxlator REST server

  proto_encode --type=TYPE [<flags>]
    Converts a JSON document to protobuf.

  proto_decode --type=TYPE [<flags>]
    Converts a proto message to JSON.

  compute_update --channel_id=CHANNEL_ID [<flags>]
    Takes two marshaled common.Config messages and computes the config update which transitions between the two.

  version
    Show version information
```

首先进入到`cli`容器中
```
docker exec -it cli bash
```

配置环境变量
```
export CHANNEL_NAME=mychannel && \
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

打印环境变量
```
echo $ORDERER_CA && echo $CHANNEL_NAME
```

### 获取配置信息
获取在`mychannel`中的最近的`block`信息，之所以获取最近的，是因为`channel`的配置都是版本化的，如果在某些时刻调用了旧版本的`channel`配置会出现一些安全性问题，因此必须要进行版本化，同时版本化的好处是保证并发性，比如当一个节点离开了之后，另一个节点加入，新版本的`channel`配置能够保证新的节点不会被认为是离开的节点。
```
peer channel fetch config config_block.pb -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA

2018-11-01 06:42:17.132 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-11-01 06:42:17.134 UTC [cli/common] readBlock -> INFO 002 Received block: 4
2018-11-01 06:42:17.135 UTC [cli/common] readBlock -> INFO 003 Received block: 2
```
这条命令会将一个`protobuf`二进制的区块配置文件存储到文件`config_block.pb`中，执行完之后的输出中
```
2018-11-01 06:42:17.135 UTC [cli/common] readBlock -> INFO 003 Received block: 2
```
这个是指最近的`mychannel`配置信息是`block 2`而不是`genesis block`，`peer channel fetch`命令会返回最近的一个配置块，这边是第三块的信息，这是因为我们使用`BYFN`脚本启动`first-network`之后，定义了两个锚节点，这个定义过程产生了两个`channel`更新交易，因此会有如下的配置顺序
- block 0: genesis block
- block 1: Org1 anchor peer update
- block 2: Org2 anchor peer update

### 转换配置为JSON
使用`configtxlator`工具对解码`channel`配置块为JSON格式，转化成了JSON格式便可以进行对应的修改了。同时需要使用一个工具`jq`来对JSON配置文件进行修剪，去除那些`headers`、元数据、交易创建者签名等等和增加组织`ORG3`没有关系的信息。
```
configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json
```
`jq`工具非常方便，能够结合管道等，使用一系列过滤规则，将JSON文件处理，去除掉或者添加信息，得到新的JSON文件。

### 添加Org3的加密材料

使用`jq`工具将之前生成的`org3.json`配置文件追加到`config.json`中，并保存到`modefied_config.json`中
```
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"Org3MSP":.[1]}}}}}' config.json ./channel-artifacts/org3.json > modified_config.json
```
解释一下：`jq`命令将`config.json`和`org3.json`文件进行组合，组合的方式就是将`org3.json`的内容嵌入到`config.json`文件的`{"channel_group":{"groups":{"Application":{"groups": {"Org3MSP":.[1]}}}}}`的[1]部分，`[0]`指的就是`config.json`，`[1]`指的就是`org3.json`，`*` 号指的是将两部分组合

这样得到的`modified_config.json`文件就包含了三个组织的配置信息了，这样之后就可以用`modified_config.json`文件重新编码为一个二进制文件以供后续使用

首先将`config.json`文件转换为二进制`protobuf`文件
```
configtxlator proto_encode --input config.json --type common.Config --output config.pb
```
然后将`modified_config.json`文件转化为`protobuf`二进制文件
```
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
```

使用`configtxlator`工具计算出两个配置文件的差异，得到一个新的用于更新组织结构的`protobuf`二进制文件
```
configtxlator compute_update --channel_id mychannel --original config.pb --updated modified_config.pb --output org3_update.pb
```

这个`org3_update.pb`文件包含了而且只包含了`Org3`的配置信息，可以转化为JSON格式看一下
```
configtxlator proto_decode --input org3_update.pb  --type common.ConfigUpdate
{
  "channel_id": "mychannel",
  "isolated_data": {},
  "read_set": {
    "groups": {
      "Application": {
        "groups": {
          "Org1MSP": {
            "groups": {},
            "mod_policy": "",
            "policies": {},
            "values": {},
            "version": "1"
          },
          "Org2MSP": {
            "groups": {},
            "mod_policy": "",
            "policies": {},
            "values": {},
            "version": "1"
          }
        },
        "mod_policy": "",
        "policies": {
          "Admins": {
            "mod_policy": "",
            "policy": null,
            "version": "0"
          },
          "Readers": {
            "mod_policy": "",
            "policy": null,
            "version": "0"
          },
          "Writers": {
            "mod_policy": "",
            "policy": null,
            "version": "0"
          }
        },
        "values": {
          "Capabilities": {
            "mod_policy": "",
            "value": null,
            "version": "0"
          }
        },
        "version": "1"
      }
    },
    "mod_policy": "",
    "policies": {},
    "values": {},
    "version": "0"
  },
  "write_set": {
    "groups": {
      "Application": {
        "groups": {
          "Org1MSP": {
            "groups": {},
            "mod_policy": "",
            "policies": {},
            "values": {},
            "version": "1"
          },
          "Org2MSP": {
            "groups": {},
            "mod_policy": "",
            "policies": {},
            "values": {},
            "version": "1"
          },
          "Org3MSP": {
            "groups": {},
            "mod_policy": "Admins",
            "policies": {
              "Admins": {
                "mod_policy": "Admins",
                "policy": {
                  "type": 1,
                  "value": {
                    "identities": [
                      {
                        "principal": {
                          "msp_identifier": "Org3MSP",
                          "role": "ADMIN"
                        },
                        "principal_classification": "ROLE"
                      }
                    ],
                    "rule": {
                      "n_out_of": {
                        "n": 1,
                        "rules": [
                          {
                            "signed_by": 0
                          }
                        ]
                      }
                    },
                    "version": 0
                  }
                "policy": {
                  "type": 1,
                  "value": {
                    "identities": [
                      {
                        "principal": {
                          "msp_identifier": "Org3MSP",
                      "n_out_of": {
                        "n": 1,
                        "rules": [
                          {
                  }
                },
                "version": "0"
              },
              "Writers": {
                "mod_policy": "Admins",
                "policy": {
                  "type": 1,
                          "role": "MEMBER"
                        },
                        "principal_classification": "ROLE"
                      }
                          {
                            "signed_by": 0
                          }
                        ]
                      }
                    },
                    "version": 0
                  }
                },
                "version": "0"
              }
            },
            "values": {
              "MSP": {
                "mod_policy": "Admins",
                "value": {
                  "config": {
                    "admins": [
                    ],
                    "crypto_config": {
                      "identity_identifier_hash_function": "SHA256",
                      "signature_hash_family": "SHA2"
                    },
                    "fabric_node_ous": {
                      "client_ou_identifier": {
                        "organizational_unit_identifier": "client"
                      },
                      "enable": true,
                      "peer_ou_identifier": {
                        "organizational_unit_identifier": "peer"
                      }
                    },
                    "intermediate_certs": [],
                    "name": "Org3MSP",
                    "organizational_unit_identifiers": [],
                    "revocation_list": [],
                    "root_certs": [
                      "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNRakNDQWVtZ0F3SUJBZ0lRV29KblBibWMvdmtjV0JIVUpBK0g3akFLQmdncWhrak9QUVFEQWpCek1Rc3cKQ1FZRFZRUUdFd0pWVXpFVE1CRUdBMVVFQ0JNS1EyRnNhV1p2Y201cFlURVdNQlFHQTFVRUJ4TU5VMkZ1SUVaeQpZVzVqYVhOamJ6RVpNQmNHQTFVRUNoTVFiM0puTXk1bGVHRnRjR3hsTG1OdmJURWNNQm9HQTFVRUF4TVRZMkV1CmIzSm5NeTVsZUdGdGNHeGxMbU52YlRBZUZ3MHhPREV3TXpFd09ESTRNemhhRncweU9ERXdNamd3T0RJNE16aGEKTUhNeEN6QUpCZ05WQkFZVEFsVlRNUk13RVFZRFZRUUlFd3BEWVd4cFptOXlibWxoTVJZd0ZBWURWUVFIRXcxVApZVzRnUm5KaGJtTnBjMk52TVJrd0Z3WURWUVFLRXhCdmNtY3pMbVY0WVcxd2JHVXVZMjl0TVJ3d0dnWURWUVFECkV4TmpZUzV2Y21jekxtVjRZVzF3YkdVdVkyOXRNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUUKZytoa2FZNlNvWk1rNjNRcVhsUGlZZ3M2Nm4wMEhNSjQ1aGhkYmlRSm5Mc2lmWE83TlhQd3k3UDh0bXd5aHNlOQovU2xGMHVYcGFDZi9XVFYyc2NOZTY2TmZNRjB3RGdZRFZSMFBBUUgvQkFRREFnR21NQThHQTFVZEpRUUlNQVlHCkJGVWRKUUF3RHdZRFZSMFRBUUgvQkFVd0F3RUIvekFwQmdOVkhRNEVJZ1FnQzJYdFlzdVhXa2tBRFdrZlBqdkQKZDZia0RaNFhVb2F5LzFmSWJPTTNuTWN3Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWGFicEM1RlZqd3V1R213NApZdElBUTlOWTFLK0V2aXV0dHRzZDdQYmpVTmNDSUVST3p6Q0h1ZDVzaFJ0VGozUWhNSkZBZVBwRGhrWkRSUGRXCnhYOHcwV1pFCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
                    ],
                    "signing_identity": null,
                    "tls_intermediate_certs": [],
                    "tls_root_certs": [
                      "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNTakNDQWZDZ0F3SUJBZ0lSQVBrUVNvWlFXQlFtekRyemdpUEQxRk13Q2dZSUtvWkl6ajBFQXdJd2RqRUwKTUFrR0ExVUVCaE1DVlZNeEV6QVJCZ05WQkFnVENrTmhiR2xtYjNKdWFXRXhGakFVQmdOVkJBY1REVk5oYmlCRwpjbUZ1WTJselkyOHhHVEFYQmdOVkJBb1RFRzl5WnpNdVpYaGhiWEJzWlM1amIyMHhIekFkQmdOVkJBTVRGblJzCmMyTmhMbTl5WnpNdVpYaGhiWEJzWlM1amIyMHdIaGNOTVRneE1ETXhNRGd5T0RNNFdoY05Namd4TURJNE1EZ3kKT0RNNFdqQjJNUXN3Q1FZRFZRUUdFd0pWVXpFVE1CRUdBMVVFQ0JNS1EyRnNhV1p2Y201cFlURVdNQlFHQTFVRQpCeE1OVTJGdUlFWnlZVzVqYVhOamJ6RVpNQmNHQTFVRUNoTVFiM0puTXk1bGVHRnRjR3hsTG1OdmJURWZNQjBHCkExVUVBeE1XZEd4elkyRXViM0puTXk1bGVHRnRjR3hsTG1OdmJUQlpNQk1HQnlxR1NNNDlBZ0VHQ0NxR1NNNDkKQXdFSEEwSUFCSkorOTVwbVdTYTNFM09DaThMOEJEeUxJMHJIRE9hZ1U4SW1FL1lpY25lSTN1TmtHb2pQcmViUApkZlJjNjBkRnh3N1kvS0d0Y0hWNUdQeWxBV1ZZT0w2alh6QmRNQTRHQTFVZER3RUIvd1FFQXdJQnBqQVBCZ05WCkhTVUVDREFHQmdSVkhTVUFNQThHQTFVZEV3RUIvd1FGTUFNQkFmOHdLUVlEVlIwT0JDSUVJR2hJQ1J0Z3lmci8KbGR0dFY4K0RUSC9FKzhHSlFDeXVtRU1SL0dkMWM3TXhNQW9HQ0NxR1NNNDlCQU1DQTBnQU1FVUNJUURkakMwbQpaNnQycVJZMVNlbklhbVh6cHphRDZ0R0pmK2VyMjZSclNoU0FLQUlnYXZjOHlQT1FtVE9qZTJnMkVNejZzMGNOCkJ2YVhZbytZblpQeSs2dXJTZTg9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
                    ]
                  },
                  "type": 0
                },
                "version": "0"
              }
            },
            "version": "0"
          }
        },
        "mod_policy": "Admins",
        "policies": {
          "Admins": {
            "mod_policy": "",
            "policy": null,
            "version": "0"
          },
          "Readers": {
            "mod_policy": "",
            "policy": null,
            "version": "0"
          },
          "Writers": {
            "mod_policy": "",
            "policy": null,
            "version": "0"
          }
        },
        "values": {
          "Capabilities": {
            "mod_policy": "",
            "value": null,
            "version": "0"
          }
        },
        "version": "2"
      }
    },
    "mod_policy": "",
    "policies": {},
    "values": {},
    "version": "0"
  }
}
```

这个JSON也反映了一个组织对应的区块配置文件是怎样的，这个文件里面在`write_set`模块里面，只包含了`Org3`的信息，这边直接去除了`org1`和`org2`的信息，是因为这一块内容并不需要更新，我们可以跳过


最后我们再次将这个处理之后的`org3_update.pb`文件转化为JSON格式
```
configtxlator proto_decode --input org3_update.pb --type common.ConfigUpdate | jq . > org3_update.json
```

接下来我们再次将之前去除掉的头部信息添加回来作为一个用于包装使用的信封
```
echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat org3_update.json)'}}}' | jq . > org3_update_in_envelope.json
```

最后，我们将这个`org3_update_in_envelope.json`文件转化成`ptotobuf`二进制文件，作为加入了新组织之后的区块配置文件
```
configtxlator proto_encode --input org3_update_in_envelope.json --type common.Envelope --output org3_update_in_envelope.pb
```

### 签名并提交更新配置

上一个步骤中我们的到了`org3_update_in_envelope.pb`文件，现在需要使用Admin用户对这个更新进行签名，默认来说对于“修改策略”默认都是"MAJORITY"，只要获得了大多数集群中的ADMIN用户的签名既可以通过更改。因为已经拥有了两个组织`org1`、`org2`，所以管理员的“大多数”就是2，接下来就需要这两个组织进行签名。如果没有这两个的签名，我们的更新操作就会被排序节点所拒绝。

首先使用`org1`来签名，因为对于`cli`容器来说环境变量的配置使得自己就是`org1`，所以直接执行
```
peer channel signconfigtx -f org3_update_in_envelope.pb

2018-11-01 10:37:50.232 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
```

~~接下来我们使用`org2`的环境变量来执行操作，当然在大多数生产环境下是不可能有一个节点能够执行组织1的ADMIN操作又能执行组织2的ADMIN操作，一般都是各个组织各自有执行各自的ADMIN操作的节点。~~

因为现在是在`cli`容器里面执行操作，所以没有必要再次对文件进行签名，直接将环境变量切换为`org2`即可
```
export CORE_PEER_LOCALMSPID="Org2MSP" && \
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt && \
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp && \
export CORE_PEER_ADDRESS=peer0.org2.example.com:7051
```

更新组织信息
```
peer channel update -f org3_update_in_envelope.pb -c $CHANNEL_NAME -o orderer.example.com:7050 --tls --cafile $ORDERER_CA

2018-11-01 10:49:09.092 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-11-01 10:49:09.105 UTC [channelCmd] update -> INFO 002 Successfully submitted channel update
```

这个操作成功之后，会返回一个新的`block` ———— `block 5`，之前`block` 0 - 2 是初始化`channel`的时候产生的，`block` 3 - 4是因为 `install` 和 `instantiate` 链码产生的，现在更新了组织信息，所以会有了第五块区块的信息。

如果想要查看区块信息，执行
```
peer channel fetch config org3config.pb -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA

configtxlator proto_decode --input org3config.pb --type common.Block > org3config.json
```

### 选主配置
选主配置主要的配置在`first-network/base/peer-base.yaml`文件
```
version: '2'
services:
  peer-base:
    image: hyperledger/fabric-peer:$IMAGE_TAG
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      # the following setting starts chaincode containers on the same
      # bridge network as the peers
      # https://docs.docker.com/compose/networking/
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_byfn
      - CORE_LOGGING_LEVEL=INFO
      #- CORE_LOGGING_LEVEL=DEBUG
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_GOSSIP_USELEADERELECTION=true
      - CORE_PEER_GOSSIP_ORGLEADER=false
      - CORE_PEER_PROFILE_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: peer node start
```
在添加了一个组织进到网络之后，需要配置对应的选主策略，新加入的节点是根据`genesis-block`自主启动的，并不包含加入的组织的信息，因此加入的`peer`节点并不能遵循`gossip`协议，因此并不能处理来自同一个组织的其他节点的区块信息，除非这些`peer`节点都获得了组织加入到`channel`的配置信息。新添加的节点都需要添加如下的配置来获得来自排序节点的`blocks`信息
1 \. 使用固定的选主模式
```
CORE_PEER_GOSSIP_USELEADERELECTION=false
CORE_PEER_GOSSIP_ORGLEADER=true
```
这个配置必须是所有节点都一样

2 \. 使用动态的选主模式
```
CORE_PEER_GOSSIP_USELEADERELECTION=true
CORE_PEER_GOSSIP_ORGLEADER=false
```
由于新添加的组织中的peers将无法形成成员视图，因此该选项将类似于静态配置，因为每个peer节点一开始回会宣称自己成为leader。但是，一旦更新了将组织添加到channel的配置事务，组织中将只有一个有效的leader。因此，如果希望组织的peers参与到leader选举中，建议使用此选项。

### 添加Org3到Channel

之前的步骤已经使得`channel`配置完成，接下来就将`org3`添加到`mychannel`。启动`org3`的`peers`和`org3-cli`
```
docker-compose -f docker-compose-org3.yaml up -d

Creating volume "net_peer0.org3.example.com" with default driver
Creating volume "net_peer1.org3.example.com" with default driver
WARNING: Found orphan containers (cli, peer1.org1.example.com, peer0.org1.example.com, peer1.org2.example.com, peer0.org2.example.com, orderer.example.com) for this project. If you removed or renamed this service in your compose fileCreating peer1.org3.example.com ... done
Creating Org3cli ... done
Creating peer0.org3.example.com ... 
Creating Org3cli ... 
```

进入到`Org3cli`容器
```
docker exec -it Org3cli bash
```

设置环境变量
```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem && export CHANNEL_NAME=mychannel
```
输出环境变量
```
echo $ORDERER_CA && echo $CHANNEL_NAME
```

接下来向排序节点发送请求获取`genesis block`，因为之前已经通过别的节点完成了`org3`的签名配置工作，所以排序节点能够确认我们发起的请求并且返回结果，如果之前的步骤没有完成或者出现了失败的现象，那么这次的请求将会被拒绝
```
peer channel fetch 0 mychannel.block -o orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA

2018-11-01 12:07:51.639 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-11-01 12:07:51.642 UTC [cli/common] readBlock -> INFO 002 Received block: 0
```
这边我们`fetch`配置的时候传递的是一个`0`参数，表明我们想要获得第一个区块，如果我们直接执行`peer channel fetch config`，那么我们就会获得5个区块的信息，但是因为我们不能从下游的区块信息开始构建账本，所以只能传递`0`

执行完成之后在工作目录下会有一个`mychannel.block`区块文件

接下来加入到`channel`
```
peer channel join -b mychannel.block

2018-11-01 12:11:57.338 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-11-01 12:11:57.388 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```

添加另一个`peer1.org3.example.com`节点到`channel`中
```
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer1.org3.example.com/tls/ca.crt \
CORE_PEER_ADDRESS=peer1.org3.example.com:7051 peer channel join -b mychannel.block

2018-11-01 12:14:51.416 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
2018-11-01 12:14:51.462 UTC [channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```

### 更新并调用链码
最后需要完成的就是更新链码并且更新背书策略，在`org3-cli`中执行
```
peer chaincode install -n mycc -v 2.0 -p github.com/chaincode/chaincode_example02/go/

Get installed chaincodes on peer:
Name: mycc, Version: 2.0, Path: github.com/chaincode/chaincode_example02/go/, Id: 46c85746ea21c801decec963f4b6b8787fa379ce1d7c536a19a4a97a49ada9ed
```
因为新链码已经在`peer0.org3.example.com`节点上安装了，接下来需要到`cli`容器中进行链码更新

新开一个终端，进入`cli`容器
```
docker exec -it cli bash
```

首先在`org1-peer0`上安装新链码
```
peer chaincode install -n mycc -v 2.0 -p github.com/chaincode/chaincode_example02/go/
```
然后修改环境变量安装链码
```
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
CORE_PEER_ADDRESS=peer0.org2.example.com:7051 CORE_PEER_LOCALMSPID="Org2MSP" \
CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
peer chaincode install -n mycc -v 2.0 -p github.com/chaincode/chaincode_example02/go/
```

设置环境变量
```
export CHANNEL_NAME=mychannel && \
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
实例化代码
```
peer chaincode upgrade -o orderer.example.com:7050 --tls true --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc -v 2.0 -c '{"Args":["init","a","90","b","210"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer')"

2018-11-01 15:35:32.123 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2018-11-01 15:35:32.123 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
```
实例化成功！ 我们会看到实例化的时候对应的背书策略已经改成了`OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer')`，这就意味着之后的交易都需要三个组织中的节点进行背书。

接下来回到`Org3cli`中执行查询
```
peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'

90
```

说明链码安装成功并且已经成功实例化，`org3`中的`peer`节点能够正常通过自己的证书进行调用链码

执行`invoke`
```
peer chaincode invoke -o orderer.example.com:7050  --tls true --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","10"]}'

2018-11-01 15:46:22.601 UTC [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 
```

执行成功，查询
```
peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'                                                                        

80
```

执行完全通过！完全反应了链码的世界状态。

查看日志
```
docker logs -f peer0.org3.example.com

...
2018-11-02 02:50:51.790 UTC [gossip/privdata] StoreBlock -> INFO 06b [mychannel] Received block [7] from buffer
2018-11-02 02:50:51.791 UTC [committer/txvalidator] Validate -> INFO 06c [mychannel] Validated block [7] in 1ms
2018-11-02 02:50:51.814 UTC [kvledger] CommitWithPvtData -> INFO 06d [mychannel] Committed block [7] with 1 transaction(s) in 22ms (state_validation=0ms block_commit=16ms state_commit=3ms)
```
会看到和脚本启动的日志不同，这个日志表明交易被签名并且被正常打包了！

## 结

添加一个组织到网络总需要在区块链上增加一个新的区块信息，而这个区块就是更具最近的一个区块的配置信息来追加，通过使用`jq`工具对配置文件进行处理之后，使用`configtxlator`工具的`compute_update`对配置进行更新，之后通过网络中原有的组织中的锚节点对更新进行签名，发送给排序节点进行排序，进而上链。

之后的步骤就是将`org`加入到`channel`中，进行链码的更新和实例化 ~

在执行了`docker-compose -f docker-compose-org3.yaml up -d`之后，建议执行`docker logs -f peer0.org3.example.com`实时跟踪日志变化，能够获得对增加组织到网络中的过程的一个更加完整的认识。