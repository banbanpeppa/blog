---
layout:     post
title:      fabric-fabcar, 从部署到开发
date:       2018-10-19 09:32:00
author:     "banban"
header-img: "/images/blockchain/hyperledger/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Hyperledger
    - Fabric
---

`fabcar`是一个使用`fabric`网络开发的一个`application`，其网络拓扑非常简单，用到了一个开发容器、一个`cli`控制容器、一个组织`org1`以及其中的一个`peer`、一个`ca`节点、一个数据库`couchdb`。这个网络下的环境可以作为一个`hello-world`程序进行了解`fabric`的开发流程
```
NAMES
dev-peer0.org1.example.com-fabcar-1.0
cli
peer0.org1.example.com
orderer.example.com
ca.example.com
couchdb
```

## 环境准备

### 下载代码
`fabcar`项目在`fabric-sample`下，因此只需要先下载对应的`fabric-sample`代码即可，同时采用分支为`release-1.2`，这个版本的`fabcar`已经修复了一些问题
```
cd $GOPATH/src/github.com/hyperledger/

git clone https://github.com/banbanpeppa/fabric-samples.git -b release-1.2 && cd fabric-samples && git branch

* (HEAD detached at v1.2.0)
  release-1.2
```

### nodejs环境
安装`nodejs`的方法有很多，这边介绍两种，一种是编译安装，另一种是源安装，主要基于`Ubuntu`系统

1\. 二进制文件安装

打开 [Node.js](https://nodejs.org/en/download/) - 下载 `version 8.9.x` or greater，目前对于 `version9.x` 还不支持，因此建议下载8.9版本系的

```
tar -xvf node-v8.12.0-linux-x64.tar.xz && cd node-v8.12.0-linux-x64/bin/ && ls -a
```

这个时候会看到里面包含了三个二进制文件，将其中`node`、`npm`两个二进制文件复制到`/usr/local/bin`中或者`/usr/bin`中，一般放置在`/usr/local/bin/`中即可

```
cp node npm /usr/local/bin

node -v
v8.12.0

npm -v 
5.6.0
```

如果`npm`的版本低于`5.6.0`，升级版本
```
npm install npm@5.6.0 -g
```

如果出现了一些类似于如下错误
```
bash: /usr/local/bin/npm: No such file or directory
```
不能将二进制文件放在/usr/local/bin下面

2\. 源安装
在`Ubuntu16.04`环境下，执行如下命令进行源安装
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

如果安装完成执行命令
```
npm -v
bash: /usr/local/bin/npm: No such file or directory
```
将`npm`真实的安装位置添加到环境变量中
```
export PATH=/usr/bin:$PATH
```

3\. 安装node-gyp

```
npm install node-gyp
```
也可以执行
```
sudo apt-get install node-gyp
```

### 部署fabcar

进入到`fabcar`

```
cd $GOPATH/src/github.com/hyperledger/fabric-samples/fabcar
```

#### 安装依赖包

安装node依赖包

```
npm install --unsafe-perm
```

如果安装过程中出现了如下错误
```
> grpc@1.10.1 install /opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc
> node-pre-gyp install --fallback-to-build --library=static_library

node-pre-gyp ERR! Pre-built binaries not installable for grpc@1.10.1 and node@8.11.2 (node-v57 ABI, glibc) (falling back to source compile with node-gyp) 
node-pre-gyp ERR! Hit error read ECONNRESET 
```
执行
```
npm i grpc@1.10.1 --unsafe-perm
```

如果安装过程中出现警告提示
```
npm WARN fabcar@1.0.0 No repository field.

audited 1277 packages in 11.318s
found 4 vulnerabilities (2 low, 2 moderate)
  run `npm audit fix` to fix them, or `npm audit` for details
```
修复，将`gprc`更新到最新版本
```
npm audit fix

> grpc@1.15.1 install /opt/go/src/github.com/fabric-samples/fabcar/node_modules/grpc
> node-pre-gyp install --fallback-to-build --library=static_library

node-pre-gyp WARN Using request for node-pre-gyp https download 
[grpc] Success: "/opt/go/src/github.com/fabric-samples/fabcar/node_modules/grpc/src/node/extension_binary/node-v57-linux-x64-glibc/grpc_node.node" is installed via remote
npm WARN fabcar@1.0.0 No repository field.

+ grpc@1.15.1
added 15 packages from 11 contributors, removed 60 packages, updated 11 packages and moved 2 packages in 30.663s
fixed 4 of 4 vulnerabilities in 1277 scanned packages
```

接下来检查安装是否成功，在`fabcar`目录下执行
```
node query.js
```
如果出现如下错误
```
/opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc/src/grpc_extension.js:57
    throw e;
    ^

Error: Cannot find module '/opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc/src/node/extension_binary/node-v57-linux-x64-glibc/grpc_node.node'
    at Function.Module._resolveFilename (module.js:547:15)
    at Function.Module._load (module.js:474:25)
    at Module.require (module.js:596:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc/src/grpc_extension.js:32:13)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
    at Function.Module._load (module.js:497:3)
```

这个时候需要修复在`node_modules`下的`grpc`
```
npm rebuild grpc


> grpc@1.10.1 install /opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc
> node-pre-gyp install --fallback-to-build --library=static_library

[grpc] Success: "/opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc/src/node/extension_binary/node-v57-linux-x64-glibc/grpc_node.node" is installed via remote

> grpc@1.15.1 install /opt/go/src/github.com/fabric-samples/fabcar/node_modules/grpc
> node-pre-gyp install --fallback-to-build --library=static_library

node-pre-gyp WARN Using request for node-pre-gyp https download 
[grpc] Success: "/opt/go/src/github.com/fabric-samples/fabcar/node_modules/grpc/src/node/extension_binary/node-v57-linux-x64-glibc/grpc_node.node" already installed
Pass --update-binary to reinstall or --build-from-source to recompile
grpc@1.10.1 /opt/go/src/github.com/fabric-samples/fabcar/node_modules/fabric-client/node_modules/grpc
grpc@1.15.1 /opt/go/src/github.com/fabric-samples/fabcar/node_modules/grpc
```

也可以强制修复
```
npm rebuild grpc --force
```

如果执行检查命令出现如下则说明成功
```
node query.js

Store path:/opt/go/src/github.com/fabric-samples/fabcar/hfc-key-store
Failed to query successfully :: Error: Failed to get user1.... run registerUser.js
```
这个错误不用担心，主要是因为没有生成对应的`hfc-key-store`，后续步骤生成

#### 部署网络
部署`fabcar`网络我们使用目录下对应的脚本`startFabric.sh`脚本，这个脚本的内容如下
```
#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE=${1:-"golang"} # 默认使用的是golang, 如果想要是用nodejs, 则执行 bash startFabric.sh node
CC_SRC_PATH=github.com/fabcar/go # 默认的链码路径
if [ "$LANGUAGE" = "node" -o "$LANGUAGE" = "NODE" ]; then
        CC_SRC_PATH=/opt/gopath/src/github.com/fabcar/node
fi

# clean the keystore
rm -rf ./hfc-key-store #删除原有的证书信息

# launch network; create channel and join peer to channel
cd ../basic-network #进入到基础网络目录, 这个目录下的网络拓扑就是一个最简单最基础的网络
./start.sh # 执行启动命令, 启动fabcar网络

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli # 部署网络环境中的cli-container，这是因为start.sh脚本并没有启动cli容器

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE" # 安装部署链码
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')" # 初始化链码和对应的背书策略
sleep 10
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabcar -c '{"function":"initLedger","Args":[""]}' # 调用链码的initLedger方法初始化账本

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "Start by installing required packages run 'npm install'\n"
printf "Then run 'node enrollAdmin.js', then 'node registerUser'\n\n"
printf "The 'node invoke.js' will fail until it has been updated with valid arguments\n"
printf "The 'node query.js' may be run at anytime once the user has been registered\n\n"
```
这个脚本的基本功能可以阅读注释部分，其中的`start.sh`脚本的内容如下
```
#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

docker-compose -f docker-compose.yml down # 将原有的基础网络关闭

docker-compose -f docker-compose.yml up -d ca.example.com orderer.example.com peer0.org1.example.com couchdb # 启动除了cli意外的几个角色的容器

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# Create the channel
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx # 在组织org1的peer0中创建名为mychannel的channel
# Join peer0.org1.example.com to the channel.
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel join -b mychannel.block # 同时org1的peer0也加入到channel
```
会看到`start.sh`脚本将基础网络中的几个关键容器启动了，这几个是`fabric`网络中具备的几个角色，包括`ca.example.com` - CA节点、`orderer.example.com` - 排序节点、`peer0.org1.example.com` - peer节点、`couchdb` - couchdb数据库节点。同时在启动了网络之后会创建一个`channel`作为区块链网络的链进行工作，同时节点`peer0`会加入到`channel`中。

关于`docker-compose.yml`文件的解读如下
```
version: '2'

networks:
  basic:

services:
  ca.example.com:
    image: hyperledger/fabric-ca
    environment:
      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server
      - FABRIC_CA_SERVER_CA_NAME=ca.example.com
      - FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.org1.example.com-cert.pem
      - FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/4239aa0dcd76daeeb8ba0cda701851d14504d31aad1b2ddddbac6a57365e497c_sk
    ports:
      - "7054:7054"
    command: sh -c 'fabric-ca-server start -b admin:adminpw' # ca系统的启动命令，这边用了一个admin用户作为ca的启动用户
    volumes:
      - ./crypto-config/peerOrganizations/org1.example.com/ca/:/etc/hyperledger/fabric-ca-server-config
    container_name: ca.example.com
    networks:
      - basic

  orderer.example.com:
    container_name: orderer.example.com
    image: hyperledger/fabric-orderer
    environment:
      - ORDERER_GENERAL_LOGLEVEL=info
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/configtx/genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/msp/orderer/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/orderer
    command: orderer
    ports:
      - 7050:7050
    volumes:
        - ./config/:/etc/hyperledger/configtx
        - ./crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/:/etc/hyperledger/msp/orderer
        - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/:/etc/hyperledger/msp/peerOrg1
    networks:
      - basic

  peer0.org1.example.com:
    container_name: peer0.org1.example.com
    image: hyperledger/fabric-peer
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_PEER_ID=peer0.org1.example.com
      - CORE_LOGGING_PEER=info
      - CORE_CHAINCODE_LOGGING_LEVEL=info
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/peer/
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      # # the following setting starts chaincode containers on the same
      # # bridge network as the peers
      # # https://docs.docker.com/compose/networking/
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_basic
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb:5984
      # The CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME and CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD
      # provide the credentials for ledger to connect to CouchDB.  The username and password must
      # match the username and password set for the associated CouchDB.
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: peer node start
    # command: peer node start --peer-chaincodedev=true
    ports:
      - 7051:7051
      - 7053:7053
    volumes:
        - /var/run/:/host/var/run/
        - ./crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp:/etc/hyperledger/msp/peer
        - ./crypto-config/peerOrganizations/org1.example.com/users:/etc/hyperledger/msp/users
        - ./config:/etc/hyperledger/configtx
    depends_on:
      - orderer.example.com
      - couchdb
    networks:
      - basic

  couchdb:
    container_name: couchdb
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    ports:
      - 5984:5984
    networks:
      - basic

  cli:
    container_name: cli
    image: hyperledger/fabric-tools
    tty: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - CORE_LOGGING_LEVEL=info
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
      - CORE_CHAINCODE_KEEPALIVE=10
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
        - /var/run/:/host/var/run/
        - ./../chaincode/:/opt/gopath/src/github.com/
        - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
    networks:
        - basic
    #depends_on:
    #  - orderer.example.com
    #  - peer0.org1.example.com
    #  - couchdb
```

在部署好网络之后，执行`docker ps -a`，获得到如下结果
```
CONTAINER ID        IMAGE                                                                                                    COMMAND                  CREATED             STATUS              PORTS                                            NAMES
c1317dd91df6        dev-peer0.org1.example.com-fabcar-1.0-5c906e402ed29f20260ae42283216aa75549c571e2e380f3615826365d8269ba   "chaincode -peer.a..."   4 days ago          Up 4 days                                                            dev-peer0.org1.example.com-fabcar-1.0
350e7ac58658        hyperledger/fabric-tools                                                                                 "/bin/bash"              4 days ago          Up 4 days                                                            cli
7f27e940243b        hyperledger/fabric-peer                                                                                  "peer node start"        4 days ago          Up 4 days           0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
609bbd337b1f        hyperledger/fabric-orderer                                                                               "orderer"                4 days ago          Up 4 days           0.0.0.0:7050->7050/tcp                           orderer.example.com
d90087715a28        hyperledger/fabric-ca                                                                                    "sh -c 'fabric-ca-..."   4 days ago          Up 4 days           0.0.0.0:7054->7054/tcp                           ca.example.com
624494f5685d        hyperledger/fabric-couchdb                                                                               "tini -- /docker-e..."   4 days ago          Up 4 days           4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
```

### 下载证书
`fabcar`网络已经部署好了，而且默认会有一个使用证书注册好的`admin`用户，这个时候我们就可以通过`enroll`调用对应`CA-server`来获得对应的证书。
```
node enrollAdmin.js

 Store path:/opt/gopath/src/github.com/hyperledger/fabric-samples/fabcar/hfc-key-store
(node:16579) DeprecationWarning: grpc.load: Use the @grpc/proto-loader module with grpc.loadPackageDefinition instead
Successfully loaded admin from persistence
Assigned the admin user to the fabric client ::
{
  "name": "admin",
  "mspid": "Org1MSP",
  "roles": null,
  "affiliation": "",
  "enrollmentSecret": "",
  "enrollment": {
    "signingIdentity": "cfb9db004303273fc14022023b7e2d4d9c0d408047e071dfb3d0ad9e33f8d46c",
    "identity": {
      "certificate": "-----BEGIN CERTIFICATE-----\nMIICATCCAaigAwIBAgIUfJS5QpErsfF1TNRer1val/qDNYMwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgxMDE3MTEyNDAwWhcNMTkxMDE3MTEy\nOTAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAElbHGkSx528151G3n+1E1AUWQGiYjeDr5UmFqAKA5\nvQWRzDoktz5xo2AhSdw4DfPGD5OJdK/M36Dq7QGmaql/l6NsMGowDgYDVR0PAQH/\nBAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFN89t7sMdzUXLw9h7ggXlCWF\nQaMQMCsGA1UdIwQkMCKAIEI5qg3NdtruuLoM2nAYUdFFBNMarRst3dusalc2Xkl8\nMAoGCCqGSM49BAMCA0cAMEQCIAPaJnNoDMjTxUzI1H3G87ava2hgOV169duQ0WNC\nz8/AAiBsQCzSYBoV8kFJJEkayvaPJ23gDBm0sE8HKRM6JowsBA==\n-----END CERTIFICATE-----\n"
    }
  }
}
```
这个时候会在目录`$GOPATH/src/github.com/hyperledger/fabric-samples/fabcar`下会有一个`hfc-key-store`目录并且会生成对应的`admin`的key。这个`admin`的`key`可以作为后续创建用户使用。

### Nodejs-SDK
由于`fabcar`网络已经部署完成，现在使用`Nodejs-SDK`在远程进行调用链码。

在远程环境下,下载`fabric-samples`代码
```
cd $GOPATH/src/github.com/hyperledger/

git clone https://github.com/banbanpeppa/fabric-samples.git -b release-1.2 && cd fabric-samples && git branch

* (HEAD detached at v1.2.0)
  release-1.2
```

下载好代码之后进入到`chaincode`下的链码目录
```
cd $GOPATH/src/github.com/hyperledger/fabric-samples/chaincode/fabcar/go
```
来看一下`fabcar.go`链码内容
```
package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type Car struct {
	Make   string `json:"make"`
	Model  string `json:"model"` 
	Colour string `json:"colour"`
	Owner  string `json:"owner"`
}

/*
 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "queryCar" {
		return s.queryCar(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createCar" {
		return s.createCar(APIstub, args)
	} else if function == "queryAllCars" {
		return s.queryAllCars(APIstub)
	} else if function == "changeCarOwner" {
		return s.changeCarOwner(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(carAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	cars := []Car{
		Car{Make: "Toyota", Model: "Prius", Colour: "blue", Owner: "Tomoko"},
		Car{Make: "Ford", Model: "Mustang", Colour: "red", Owner: "Brad"},
		Car{Make: "Hyundai", Model: "Tucson", Colour: "green", Owner: "Jin Soo"},
		Car{Make: "Volkswagen", Model: "Passat", Colour: "yellow", Owner: "Max"},
		Car{Make: "Tesla", Model: "S", Colour: "black", Owner: "Adriana"},
		Car{Make: "Peugeot", Model: "205", Colour: "purple", Owner: "Michel"},
		Car{Make: "Chery", Model: "S22L", Colour: "white", Owner: "Aarav"},
		Car{Make: "Fiat", Model: "Punto", Colour: "violet", Owner: "Pari"},
		Car{Make: "Tata", Model: "Nano", Colour: "indigo", Owner: "Valeria"},
		Car{Make: "Holden", Model: "Barina", Colour: "brown", Owner: "Shotaro"},
	}

	i := 0
	for i < len(cars) {
		fmt.Println("i is ", i)
		carAsBytes, _ := json.Marshal(cars[i])
		APIstub.PutState("CAR"+strconv.Itoa(i), carAsBytes)
		fmt.Println("Added", cars[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) createCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	carAsBytes, _ := json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) queryAllCars(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "CAR0"
	endKey := "CAR999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) changeCarOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	carAsBytes, _ := APIstub.GetState(args[0])
	car := Car{}

	json.Unmarshal(carAsBytes, &car)
	car.Owner = args[1]

	carAsBytes, _ = json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	return shim.Success(nil)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	// 创建智能合约
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
```
链码包含了对`fabcar`的基本操作，这个也可以作为链码的基本模板

进入到`nodejs-sdk`的目录
```
cd $GOPATH/src/github.com/hyperledger/fabric-samples/fabcar && ls -a

.  ..  enrollAdmin.js  .gitignore  hfc-key-store  invoke.js  node_modules  package.json  package-lock.json  query.js  registerUser.js  startFabric.sh
```

首先获取`admin`的公私钥
```
node enrollAdmin.js
```
在`hfc-key-store`目录下面生成一个`admin`文件和两个公私钥文件

接下来注册一个用户`user1`，使用`registerUser.js`
```
node registerUser.js
```
在`hfc-key-store`目录下面生成一个`user1`文件和两个公私钥文件，有了这个便可以删除`admin`的文件然后使用`user1`来调用链码。

> 这边需要声明一下，`enrollAdmin.js`之所以能够成功是因为在这段js代码里面使用了admin的账号名和密码，也就是说正常情况下这个文件是不会随意给联盟用户的。


接下来就可以通过`query.js`和`invoke.js`来操作链码了，只需要注意这两个代码文件里面的以下两个代码块既可
```
query.js

const request = {
	//targets : --- letting this default to the peers assigned to the channel
	chaincodeId: 'fabcar',
	fcn: 'queryAllCars',
	args: ['']
};
```
```
invoke.js

var request = {
	//targets: let default to the peer assigned to the client
	chaincodeId: 'fabcar',
	fcn: 'changeCarOwner',
	args: ['CAR10', 'banban'],
	chainId: 'mychannel',
	txId: tx_id
};
```
这两个代码块都是对应到链码`fabcar.go`中的各个方法的，因此可以修改这些来修改对应的区块状态

## fabric-tool命令

`peer`

### peer channel
```
peer channel list

2018-10-23 03:14:51.395 UTC [channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
Channels peers has joined: 
mychannel
mychannel2
```

### peer chaincode

#### peer chaincode list

查看安装好的链码
```
peer chaincode list --installed

Get installed chaincodes on peer:
Name: fabcar, Version: 1.0, Path: github.com/fabcar/go, Id: 4846dcee8e67da7d20eac366587b897cf3906c5fc90a2357f4849aec01fc5358
Name: fabcar, Version: 2.0, Path: github.com/fabcar/go, Id: 9fc5910f9c6546d287c56c6833487467426efe1f27d95183b9229cd073f0dc4a
Name: fabcar2, Version: 2.0, Path: github.com/fabcar/go, Id: 1b9014047d9c12d0c75e5401d0e10adc17ef5e24f070794226094eb8e93a3c1f
```

查看链码实例化在哪一个channel

```
peer chaincode list --instantiated -C <channel-name>

Get instantiated chaincodes on channel mychannel:
Name: fabcar, Version: 1.0, Path: github.com/fabcar/go, Escc: escc, Vscc: vscc (这边会看到fabcar链码并没有更换到 2.0 版本，因为没有实例化2.0版本的链码)
Name: fabcar2, Version: 2.0, Path: github.com/fabcar/go, Escc: escc, Vscc: vscc
```

#### peer chaincode query

调用链码方法获得查询结果
```
peer chaincode query -C <channel-name> -n <chaincode-name> -c '{"Args":["<function-name>"]}'

如
peer chaincode query -C mychannel -n fabcar -c '{"Args":["queryAllCars"]}'

[{"Key":"CAR0", "Record":{"colour":"blue","make":"Toyota","model":"Prius","owner":"Tomoko"}},{"Key":"CAR1", "Record":{"colour":"red","make":"Ford","model":"Mustang","owner":"Brad"}},{"Key":"CAR10", "Record":{"colour":"","make":"","model":"","owner":"banban"}},{"Key":"CAR2", "Record":{"colour":"green","make":"Hyundai","model":"Tucson","owner":"Jin Soo"}},{"Key":"CAR3", "Record":{"colour":"yellow","make":"Volkswagen","model":"Passat","owner":"Max"}},{"Key":"CAR4", "Record":{"colour":"black","make":"Tesla","model":"S","owner":"Adriana"}},{"Key":"CAR5", "Record":{"colour":"purple","make":"Peugeot","model":"205","owner":"Michel"}},{"Key":"CAR6", "Record":{"colour":"white","make":"Chery","model":"S22L","owner":"Aarav"}},{"Key":"CAR7", "Record":{"colour":"violet","make":"Fiat","model":"Punto","owner":"Pari"}},{"Key":"CAR8", "Record":{"colour":"indigo","make":"Tata","model":"Nano","owner":"Valeria"}},{"Key":"CAR9", "Record":{"colour":"brown","make":"Holden","model":"Barina","owner":"Shotaro"}}]
```

#### peer chaincode upgrade
更新链码，通过版本区分
```
peer chaincode upgrade -o <orderer-host> -n <chaincode-name> -v <version> -C <channel-name> -c <Init-function-args-json> -p <chaincode-path> -l <chaincode-language>
```
如

```
peer chaincode upgrade -o orderer.example.com:7050 -n fabcar -v 2.0 -C mychannel -c '{"Args":[""]}' -p github.com/fabcar/go -l golang

2018-10-23 05:55:46.160 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2018-10-23 05:55:46.161 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
```

查看链码版本是否已经更新
```
peer chaincode list --instantiated -C mychannel

Get instantiated chaincodes on channel mychannel:
Name: fabcar, Version: 2.0, Path: github.com/fabcar/go, Escc: escc, Vscc: vscc
Name: fabcar2, Version: 2.0, Path: github.com/fabcar/go, Escc: escc, Vscc: vscc
```

fabcar链码更新了链码之后，需要进一步执行初始化账本操作，使用
```
peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n fabcar -c '{"function":"initLedger","Args":[""]}'

2018-10-23 06:01:10.067 UTC [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 
```

#### peer chaincode install
安装链码
```
peer chaincode install -n <chaincode-name> -v <chaincode-version> -p <chaincode-path> -l <chaincode-language>
```
如
```
LANGUAGE=golang && CC_SRC_PATH=github.com/fabcar/go && peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
```

#### peer chaincode instantiate
实例化链码，分为两种，一种是开启了`TLS`认证的，一种是关闭了`TLS`认证的

开启`TLS`认证
```
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem && \ 
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile $ORDERER_CA -C mychannel -n fabcar -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"

2018-02-22 16:33:53.324 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2018-02-22 16:33:53.324 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2018-02-22 16:34:08.698 UTC [main] main -> INFO 003 Exiting.....
```

关闭`TLS`认证
```
peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"


2018-02-22 16:34:09.324 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
2018-02-22 16:34:09.324 UTC [chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
2018-02-22 16:34:24.698 UTC [main] main -> INFO 003 Exiting.....
```

## 总结

`fabcar`是一个最简单的`fabric`网络拓扑，可以很好地进行对超级账本进行实践。如果想要修改对应的链码并且替换原有的链码。只需要使用`peer chaincode upgrade`命令既可实现！同时会看到通过`nodejs-sdk`和链码交互非常方便，得益于`fabric-client`库的实现，通过`grpc`的通讯实现和区块链网络交互。

后续会补充`java-sdk`对接到`fabcar`网络。