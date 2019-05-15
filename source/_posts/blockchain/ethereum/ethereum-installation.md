---
layout:     post
title:      以太坊开发环境搭建
date:       2019-1-12 19:00:00
author:     "banban"
header-img: "/images/blockchain/ethereum/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Ethereum
---

# 以太坊开发环境搭建

## 安装以太坊

### Ubuntu 16.04
分别执行命令
```
apt-get update -y 
apt-get install -y software-properties-common
add-apt-repository -y ppa:ethereum/ethereum
add-apt-repository -y ppa:ethereum/ethereum-dev
apt-get update -y 
apt-get install -y ethereum
```
安装solidity语言环境
```
sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get -y update
sudo apt-get -y install solc
```
使用`npm`命令安装`web3js`支持，注：web3模块的版本必须是0.20.x左右的，如果是1.0.x版本，在创建智能合约及许多步骤都会报错
```
npm install -g web3@0.20.7
npm install -g ethereumjs-testrpc
```
安装`truffle`工具
```
npm install -g truffle
```
安装成功之后查看版本
```
solc --version
truffle version
geth version
```

### Darwin
安装`ethereum`
```
brew update
brew upgrade
brew tap ethereum/ethereum
brew install ethereum
```
安装`solidity`
```
brew install solidity
```
使用`npm`命令安装`web3js`支持
```
npm install -g web3
npm install -g ethereumjs-testrpc
```
安装`truffle`工具
```
npm install -g truffle
```
安装成功之后查看版本
```
solc --version
truffle version
geth version
```

## 启动以太坊私链

准备一个私链的工作目录，例如
```
mkdir -p ~/ethereum/ && export ETHEREUM_WORKSPACE=~/ethereum && cd $ETHEREUM_WORKSPACE
```
准备`genesis.json`文件
```
vim genesis.json
```
内容如下
```
{
  "config": {
    "chainId": 2019,
    "homesteadBlock": 0,
    "eip155Block": 0,
    "eip158Block": 0
  },
  "nonce": "0x0000000000000056",
  "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "difficulty": "0x40000",
  "alloc": {},
  "coinbase": "0x0000000000000000000000000000000000000000",
  "timestamp": "0x00",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "extraData": "",
  "gasLimit": "0xffffffff"
}
```
创建`data`文件夹，执行(注：这边文件夹可以自定义)
```
geth --datadir data --rpc --rpccorsdomain "*" init ./genesis.json
```
执行如下命令，其中`--datadir`的参数与上面命令相同，`--networkid`的参数与`genesis.json`中的参数相同：
```
geth --datadir data --networkid 2019 --rpc --rpccorsdomain "*" --ws --wsorigins="*" --rpcapi "eth,web3,personal,net,miner,admin,debug" --wsapi="eth,web3,personal,net,miner,admin,debug" --nodiscover --port 30303 --rpcport 8545 console 
```
创建`coinbase`账户
```
personal.newAccount("ethereum")
```
查看`coinbase`账户的余额
```
web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]),"ether")
```
开始挖矿，使用一个线程即可
```
miner.start(1)
```
新开启一个终端，连接到私链
```
geth attach http://127.0.0.1:8545
```
解锁`coinbase`账户
```
personal.unlockAccount(web3.eth.accounts[0], "ethereum", 31536000)
```
这边解锁时间是一年，在生产环境下不建议这样设置。

## Geth中常用命令介绍
- 创建新账号 `personal.newAccount()`或者 `personal.newAccount("123456")`
- 查看节点信息 `admin.nodeInfo`
- 开始挖矿 `miner.start(1)`
- 停止挖矿 `miner.stop()`
- 查看当前矿工账号 `eth.coinbase(默认为第一个账户)`
- 修改矿工账号 `miner.setEtherbase(eth.accounts[1])`
- 查看账户信息 `eth.accounts[0]`
- 查看账户余额 `eth.getBalance(eth.accounts[0])`
- 解锁账号 `personal.unlockAccount(eth.accounts[0])`
- 转账 `eth.sendTransaction({from:eth.accounts[0],to:"address",value:web3.toWei(3,"ether")})`
- 查看区块高度 `eth.blockNumber`
- 通过区块号查看区块 `eth.getBlock(1)`
- 通过交易id查看交易 `eth.getTransaction("TxId")`

## 参考资料

### 文档

- [web3js doc](https://web3js.readthedocs.io/en/1.0/index.html)
- [web3.js 3.0中文手册](http://cw.hubwiz.com/card/c/web3.js-1.0/)

### 源码

- [web3js-github](https://github.com/ethereum/web3.js)
- [truffle-github](https://github.com/trufflesuite/truffle)

### 博客

- [用web3.js与智能合约交互](https://blog.csdn.net/zhj_fly/article/details/79458467)
- [web3js调用已部署智能合约的function](https://blog.csdn.net/hdyes/article/details/80818183)
- [以太坊实战——从nodejs终端使用web3模块](https://blog.csdn.net/u014633283/article/details/83210946)