---
layout:     post
title:      在以太坊测试网络 Goerli 部署 Swarm
author:     "banban"
header-img: "/images/blockchain/ethereum/swarm/bg.jpeg"
catalog: true
tags:
    - Blockchain
    - Ethereum
    - Swarm
---

# 在以太坊测试网络 Goerli 部署 Swarm

以下主要以 Linux 系统为例，Darwin 类似。

## Quick Start

### 安装 Bee Clef

这个服务负责签名，是 Bee 节点的前置依赖之一。

**Ubuntu / Debian / Raspbian**

执行命令，通过 deb 包安装
```bash
wget https://github.com/ethersphere/bee-clef/releases/download/v0.4.9/bee-clef_0.4.9_amd64.deb
sudo dpkg -i bee-clef_0.4.9_amd64.deb
```

**CentOS**

```bash
wget https://github.com/ethersphere/bee-clef/releases/download/v0.4.9/bee-clef_0.4.9_amd64.rpm
sudo rpm -i bee-clef_0.4.9_amd64.rpm
```

**MacOS**

```bash
brew tap ethersphere/tap
brew install swarm-clef
```
运行服务
```bash
brew services start swarm-clef
```

### 安装 Bee

Bee 节点是分布式存储服务的主体服务。

**Ubuntu / Debian / Raspbian**

执行命令，通过 deb 包安装
```bash
wget https://github.com/ethersphere/bee/releases/download/v0.5.3/bee_0.5.3_amd64.deb
sudo dpkg -i bee_0.5.3_amd64.deb
```

**CentOS**

```bash
wget https://github.com/ethersphere/bee/releases/download/v0.5.3/bee_0.5.3_amd64.rpm
sudo rpm -i bee_0.5.3_amd64.rpm
```

**MacOS**

```bash
brew tap ethersphere/tap
brew install swarm-bee
```
运行服务
```bash
brew services start swarm-bee
```

## 运行属于自己的 Goerli 节点

安装好工具之后，可以使用默认的配置运行 bee 节点，但是默认 bee 节点连接的以太坊测试网络的 endpoint 为：https://rpc.slock.it/goerli, 这个入口很容易被堵塞(发送的交易请求过多)，进而导致 bee 节点无法正常工作，报错如下：
```bash
Error: get chain id: Post "https://rpc.slock.it/goerli": dial tcp 87.117.121.163:443: i/o timeout
```
为此安装属于个人的 Goerli endpoint，进入：https://infura.io/，创建项目

![](/images/blockchain/ethereum/swarm/infura_create_project.png)
创建之后选择测试网络 Goerli，记录保存 endpoint 地址：
![](/images/blockchain/ethereum/swarm/infura_endpoint.png)

将地址替换配置文件
```bash
vim /etc/bee/bee.yaml

...
# swap-endpoint: https://rpc.slock.it/goerli 注释默认测试网络
swap-endpoint: https://goerli.infura.io/v3/6a542820bd61406e98c3a682312eb9ed
...
```

### 运行 bee 节点

运行 bee 节点准备存储工作（挖矿）。