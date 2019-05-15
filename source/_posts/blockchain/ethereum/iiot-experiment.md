---
layout:     post
title:      使用以太坊进行IIOT实验
date:       2019-1-13 19:00:00
author:     "banban"
header-img: "/images/blockchain/ethereum/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Ethereum
---

# 使用以太坊进行IIOT实验

## 编写智能合约
合约`Iiot.sol`内容如下
```
//由于需要开启返回数组类型，因此需要开启这个实验环境下的环境
pragma experimental ABIEncoderV2;
//编译器版本需要是0.4.25+commit.59dbf8f1
pragma solidity >=0.4.22 <0.6.0;

//本合约用于工业物联网中实现访问控制及其数据读写控制
contract Iiot {

    struct Node {
        string id;
        string ip;
        string name;
        string area;
        string _type;
        string nodeType;
        string productType;
        uint8 productAmount;
        string status;
        bytes delegatorSignature;
        address delegator;
    }

    //各种节点类型
    string TYPE_SUPPLIER = "supplier";
    string TYPE_MANUFACTURER = "manufacturer";
    string TYPE_COVEYANCE = "conveyance";
    string TYPE_RETAIL = "retail";

    mapping (address => Node) enrolled_nodes;
    mapping (string => address) used;
    mapping (address => string[]) info_lists;
    mapping (address => string) policy_storage;

    string[] infos = new string[](1);
    address admin;

    constructor() public {
      admin = msg.sender;
      make_node(admin, "CH0", "0.0.0.0", "admin", "*", "admin", "*", "none", 0, "active", "none", admin);
    }

    //登记节点，登记的时候需要提交签名和所签名的内容hash，在校验通过之后才会登记成功，并将成功的节点添加到storage中
    function enroll_manager_node(string memory id, string memory ip, string memory name, string memory area,
       string memory _type, string memory nodeType, string memory productType, uint8 productAmount,
       bytes memory signature, bytes32 hash, address delegator) public returns(bool, string memory) {
      address enroll_node = msg.sender;
      //判断属性内容是否都不为空
      //判断id是否已经存在，name是否存在， 判断ip地址是否存在
      if(check_str_equal(id, "") || check_str_equal(ip, "") || check_str_equal(name, "") ||
        check_str_equal(area, "") || check_str_equal(_type, "") || check_str_equal(nodeType, "")) {
        return (false, "parameters empty error");
      }
    
      if (used[name] != address(0x0)) {
        return (false, "name is used");
      }
      if (used[ip] != address(0x0)) {
        return (false, "ip is used");
      }

      // 判断委托人是否存在，并判断是否合法委托人
      if (bytes(enrolled_nodes[delegator].id).length == 0) {
        return (false, "delegator is not exsits.");
      } else if (enroll_node == delegator) {
        return (false, "enroller can not be delegator.");
      }

      if(check_str_equal(_type, TYPE_MANUFACTURER) &&  check_str_equal(enrolled_nodes[delegator]._type, TYPE_SUPPLIER)) {
        return (false, "not allowed enroll operator");
      } else if (check_str_equal(_type, TYPE_COVEYANCE) && check_str_equal(enrolled_nodes[delegator]._type, TYPE_MANUFACTURER)) {
        return (false, "not allowed enroll operator");
      } else if (check_str_equal(_type, TYPE_RETAIL) && check_str_equal(enrolled_nodes[delegator]._type,TYPE_COVEYANCE)) {
        return (false, "not allowed enroll operator");
      }

      // 判断签名是否正确
      address sign_address = ecrecovery(hash, signature);
      if (sign_address != delegator) {
        return (false, "error signature.");
      }

      // 登记节点
      enrolled_nodes[enroll_node].id = id;
      enrolled_nodes[enroll_node].ip = ip;
      enrolled_nodes[enroll_node].name = name;
      enrolled_nodes[enroll_node].area = area;
      enrolled_nodes[enroll_node]._type = _type;
      enrolled_nodes[enroll_node].nodeType = nodeType;
      enrolled_nodes[enroll_node].productType = productType;
      enrolled_nodes[enroll_node].productAmount = productAmount;
      enrolled_nodes[enroll_node].status = "active";
      enrolled_nodes[enroll_node].delegatorSignature = signature;
      enrolled_nodes[enroll_node].delegator = delegator;

      used[name] = enroll_node;
      used[ip] = enroll_node;

      return (true, "ok");
    }

    //登记内部节点，登记的时候需要提交签名和主节点所签名的内容hash，在校验通过之后才会登记成功，并将成功的节点添加到storage中
    function enroll_internal_node(string memory id, string memory ip, string memory name, string memory area,
       string memory _type, string memory nodeType, string memory productType, uint8 productAmount,
       bytes memory signature, bytes32 hash, address delegator) public returns(bool, string memory) {
      address enroll_node = msg.sender;
      //判断属性内容是否都不为空
      //判断id是否已经存在，name是否存在， 判断ip地址是否存在
      if(check_str_equal(id, "") || check_str_equal(ip, "") || check_str_equal(name, "") ||
        check_str_equal(area, "") || check_str_equal(_type, "") || check_str_equal(nodeType, "")) {
        return (false, "parameters empty error");
      }

      if (used[name] != address(0x0)) {
        return (false, "name is used");
      }
      if (used[ip] != address(0x0)) {
        return (false, "ip is used");
      }

      // 判断委托人是否存在，并判断是否合法委托人
      if (bytes(enrolled_nodes[delegator].id).length == 0) {
        return (false, "delegator is not exsits.");
      } else if (enroll_node == delegator) {
        return (false, "enroller can not be delegator.");
      } else if(!check_str_equal(_type, enrolled_nodes[delegator]._type)) {
        return (false, "delgator does not have the permission.");
      }

      // 判断签名是否正确
      address sign_address = ecrecovery(hash, signature);
      if (sign_address != delegator) {
        return (false, "error signature.");
      }

      // 登记节点
      enrolled_nodes[enroll_node].id = id;
      enrolled_nodes[enroll_node].ip = ip;
      enrolled_nodes[enroll_node].name = name;
      enrolled_nodes[enroll_node].area = area;
      enrolled_nodes[enroll_node]._type = _type;
      enrolled_nodes[enroll_node].nodeType = nodeType;
      enrolled_nodes[enroll_node].productType = productType;
      enrolled_nodes[enroll_node].productAmount = productAmount;
      enrolled_nodes[enroll_node].status = "active";
      enrolled_nodes[enroll_node].delegatorSignature = signature;
      enrolled_nodes[enroll_node].delegator = delegator;

      used[name] = enroll_node;
      used[ip] = enroll_node;

      return (true, "ok");
    }

    function  get_node() public returns (string memory id, string memory name, string memory ip) {
      address sender = msg.sender;
      Node memory node = enrolled_nodes[sender];
      return (node.id, node.name, node.ip);
    }

    function write_iiot_information(string info, string policy, bytes signature, bytes32 hash) public returns (string) {
        address sender = msg.sender;
        // 如果是未成功登记的节点，无法进行数据写入，直接返回错误信息
        if (bytes(enrolled_nodes[sender].id).length == 0) {
          return "forbidden operator because of unkown node.";
        }
        address sign_address = ecrecovery(hash, signature);
        if (sign_address == sender) {
            infos[infos.length++] = info;
            info_lists[sender].push(info);
            policy_storage[sender] = policy;
        } else {
            return "fail because of sinature not right.";
        }
        return policy_storage[sender];
    }

    function get_iiot_information_length() public returns (uint) {
        address sender = msg.sender;
        string[] x = info_lists[sender];
        return x.length;
    }
    
    //获取iiot设备写入的信息内容
    function read_iiot_infomation_list(uint index) public returns (string){
        address sender = msg.sender;
        string[] x = info_lists[sender];
        if (x.length > 0 && index < x.length) {
            return x[index];
        }
        return "no information till now";
    }

    //读取iiot写入到区块链的访问策略
    function read_iiot_policy_storage() public view returns (string){
        return policy_storage[msg.sender];
    }

    //内部方法，判断两个字符串是否相等
    function check_str_equal(string memory str1, string memory str2) internal returns (bool) {
      if(keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2))) {
        return true;
      }
      return false;
    }

    //通过方法登记节点，由于以太坊对本地变量的限制，点用此方法有可能会出现栈溢出问题
    function make_node(address node, string memory id, string memory ip, string memory name,
        string memory area, string memory _type, string memory nodeType, string memory productType,
        uint8 productAmount, string memory status, bytes memory signature, address delegator) internal {
      enrolled_nodes[node].id = id;
      enrolled_nodes[node].ip = ip;
      enrolled_nodes[node].name = name;
      enrolled_nodes[node].area = area;
      enrolled_nodes[node]._type = _type;
      enrolled_nodes[node].nodeType = nodeType;
      enrolled_nodes[node].productType = productType;
      enrolled_nodes[node].productAmount = productAmount;
      enrolled_nodes[node].status = status;
      enrolled_nodes[node].delegatorSignature = signature;
      enrolled_nodes[node].delegator = delegator;

      used[name] = node;
      used[ip] = node;
    }
    //校验签名是否正确
    function ecrecovery(bytes32 hash, bytes memory sig) internal returns (address) {
      bytes32 r;
      bytes32 s;
      uint8 v;

      if (sig.length != 65) {
        return address(0x0);
      }

      assembly {
        r := mload(add(sig, 32))
        s := mload(add(sig, 64))
        v := and(mload(add(sig, 65)), 255)
      }

      if (v < 27) {
        v += 27;
      }

      if (v != 27 && v != 28) {
        return address(0x0);
      }
      bytes memory prefix = "\x19Ethereum Signed Message:\n32";
      hash = sha3(prefix, hash);
      return ecrecover(hash, v, r, s);
    }
}
```
## 启动以太坊网络
本实验环境基于 Ubuntu 16.04 系统，以太坊相关软件版本为：
```
nodejs   v10.13.0
npm      6.5.0
geth     1.8.20-stable
Truffle  v4.1.15 (core: 4.1.15)
Solidity v0.4.25 (solc-js)
web3     1.x
testrpc v6.0.3 (ganache-core: 2.0.2)
```
具体安装查看本专栏其他博客内容。

启动以太坊网络
```
testrpc
```
![](/images/blockchain/ethereum/iiot/start-net.png)

打开网页版本`remix`：http://remix.ethereum.org/，使用这个插件的好处是可以任意选择编译器，这里选择的编译器是`0.4.25+commit.59dbf8f1.Emscripten.clang`，项目结构如下
![](/images/blockchain/ethereum/iiot/remix-web.png)

## 编译代码
首先使用remix-web进行代码编译，之后选择`Run`模块，选择`Web3 Provider`之后确定为本地环境即可，然后部署代码到本地环境。

由于之后使用web3js的client时，需要用到智能合约编译的abi以及地址，则使用truffle工具进行abi编译

```
mkdir Iiot && cd Iiot
truffle init
```
进入到目录之后，新建代码文件`Iiot.sol`，将代码复制进去，如下
![](/images/blockchain/ethereum/iiot/atom-truffle.png)

编译代码
```
truffle compile
```
会生成`build`目录，其中会有`Iiot.json`，其中内容包含了abi

## 编写测试代码，模拟IIOT环境
 
### 管理员账户签名
```
node admin_sign.js

待签名信息: blockchain0xa16ec2786de743e0c3b0fefb3fc7319470535f72
对信息进行hash处理得到shaMsg: 0xe0cf2a7b5f7efc14ebe44d494412788e3c1ffc6212f6ea4e2fbe5ce15e3aa427
账户 0x958814062fda3ab677acf373196935e539e61131 对信息进行签名得到signedData: 0x7a339f232d6d1674d9fe0389a54398f7db670312d62fffbcb95cd1576dbb2f6d629c1aa6f457548d99856d1edcf74bfff27de50952c60d764c03665b492aa0d501
```
实验中，所有节点都是对单词`blockchain`加上需要签名的节点的地址的内容进行hash，然后对hash值进行签名，使用的是以太坊生成的私钥进行签名。

### supplier供应商

#### 登记节点
因为供应商的角色比较高，因此其需要泗洪管理员admin的签名进行登记，如果不是管理的签名则登记失败。
登记的客户端代码如下所示
```
var delegator_account = "0x958814062fda3ab677acf373196935e539e61131"; //授权者，也就是admin
var signature = "0x330fbb0e43046efb4de67719f8d93ca67a6ad8cda093e368143c2c9267b2b677683bfd4115cc70c32a1f949b06c773904e2e7ed01c99efc3d8220af27f5fce0f01";  //admin为供应商签好的名
var hash = "0x7ee156df5091fbef71b96557542210a9c9ca851cc85aaf60026519b4aaccf491";

iiot_contract.methods
.enroll_manager_node("CH01", "192.168.0.2", "suppiler01", "guangdong", "供应商", "主节点", "水果", 100, signature, hash, delegator_account)
.call({from: supplier, gas: 300000}).then(function(result){
    console.log(result);
});
```
对应到合约方法
```
//登记节点，登记的时候需要提交签名和所签名的内容hash，在校验通过之后才会登记成功，并将成功的节点添加到storage中
function enroll_manager_node(string memory id, string memory ip, string memory name, string memory area,
    string memory _type, string memory nodeType, string memory productType, uint8 productAmount,
    bytes memory signature, bytes32 hash, address delegator) public returns(bool, string memory);
```
执行结果如下
![](/images/blockchain/ethereum/iiot/supplier_enroll.png)

#### 获取自己节点信息以及为自己的节点签名登记
suppiler可以通过调用合约方法获得自己的信息，内容在脚本代码`supplier_get_node_info.js`中，执行结果如下
![](/images/blockchain/ethereum/iiot/supplier_op.png)

#### 读写IIOT产生的数据
suppiler的节点产生数据之后需要写入数据到区块链中，执行结果如下
![](/images/blockchain/ethereum/iiot/supplier_read_write.png)

#### 签名不正确无法执行写入操作
由于签名不正确,则无法写入数据到区块链
![](/images/blockchain/ethereum/iiot/write_fail.png)

### supplier-internal-node

#### 登记内部节点成功
```
bash-3.2$ node supplier_enroll_internal_node.js 
Result { '0': true, '1': 'ok' }
{ id: 'CH03',
  ip: '192.168.0.3',
  name: 'suppiler-child-01',
  area: 'guangdong',
  _type: '供应商',
  nodeType: '子节点',
  productType: '水果',
  productAmount: 100,
  signature:
   '0x9bff0f16ea43200dc3623fece41538fa7193ea24c199b1fae42ef2f17aafade6737e2b5299618453fee737a8f9990e987a2d759eee1569745766cd804b4d6cc101',
  hash:
   '0x7ee156df5091fbef71b96557542210a9c9ca851cc85aaf60026519b4aaccf491',
  delegator: '0x8215e1a386ea33470c51017bb21501c33bab85fc' 
}
bash-3.2$ 
```

#### 登记内部节点失败
如果用了非法的签名或者对应的委托人不存在，则登记会失败
```
bash-3.2$ node supplier_enroll_internal_node.js 
Result { '0': false, '1': 'delegator is not exsits.' }
{ id: 'CH03',
  ip: '192.168.0.3',
  name: 'suppiler-child-01',
  area: 'guangdong',
  _type: '供应商',
  nodeType: '子节点',
  productType: '水果',
  productAmount: 100,
  signature:
   '0x9bff0f16ea43200dc3623fece41538fa7193ea24c199b1fae42ef2f17aafade6737e2b5299618453fee737a8f9990e987a2d759eee1569745766cd804b4d6cc101',
  hash:
   '0x7ee156df5091fbef71b96557542210a9c9ca851cc85aaf60026519b4aaccf491',
  delegator: '0x9ea1247cf93f7a2982e126df62c99d5028dea81f' 
}
bash-3.2$ 
```

#### 内部节点获取节点信息
```
bash-3.2$ node supplier_internal_get_node_info.js 

return node information: node_id: CH03, node_ip: 192.168.0.66, node_name = suppiler-child-04
```
#### 内部节点读写IIOT数据
```
bash-3.2$ node supplier_internal_node_write_information.js 


result: suppiler or manufacturer or admin
iiot node suppiler write information, info: iiot node: weight: 15kg, color: red, height: 10cm,..., policy: suppiler or manufacturer or admin, signature: 0x1ad5d6778d9e1d9f79dfb40fd0f7ca5e194e91ed63e476ab5f91b59eb6a9e3760526b45c09d8409709b91f15518d12d94f6b68d0614fbb20a596ff38fd56858300, hash: 0x7ee156df5091fbef71b96557542210a9c9ca851cc85aaf60026519b4aaccf491
```

#### 读写失败
如果是没有登记成功的节点，进行写入区块链会返回非法操作的错误
```
bash-3.2$ node supplier_internal_node_read_write.js 

result: forbidden operator because of unkown node.
iiot internal node suppiler write information, info: iiot internal node: weight: 15kg, color: red, height: 10cm,..., policy: suppiler or manufacturer or admin, signature: 0x9bff0f16ea43200dc3623fece41538fa7193ea24c199b1fae42ef2f17aafade6737e2b5299618453fee737a8f9990e987a2d759eee1569745766cd804b4d6cc101, hash: 0x7ee156df5091fbef71b96557542210a9c9ca851cc85aaf60026519b4aaccf491
```
![](/images/blockchain/ethereum/iiot/internal_node_op.png)

### 其余节点
其余节点的登记于操作和供应商类似，其中权限都在智能合约中控制，不再赘述。

## 仿真平台概况
### 开发语言
- JavaScript
  - 用于开发`node-client`
- Solidity
  - 用于开发智能合约
  - 版本0.4.15
  - 简介: Solidity is an object-oriented, high-level language for implementing smart contracts. Smart contracts are programs which govern the behaviour of accounts within the Ethereum state.
- Shell
  - 用于实现node-client与智能合约的交互
  - 控制不同节点的输入输出

### 开发环境
操作系统: Ubuntu 16.04
软件环境
```
nodejs   v10.13.0
npm      6.5.0
geth     1.8.20-stable
Truffle  v4.1.15 (core: 4.1.15)
Solidity v0.4.25 (solc-js)
web3     1.x
testrpc v6.0.3 (ganache-core: 2.0.2)
```

### 使用到的api

1\. web3.eth.sign
web3.eth.sign()方法使用指定的账户对数据进行签名，该账户必须先解锁。
调用：
```
web3.eth.sign(dataToSign, address [, callback])
```
参数：
- dataToSign：String - 待签名的数据。对于字符串将首先使用web3.utils.utf8ToHex()方法将其转换为16进制
- address：String|Number - 用来签名的账户地址。或者本地钱包web3.eth.accounts.wallet中的地址或其序号
- callback：Function - 可选的回调函数，其第一个参数为错误对象，第二个参数为结果

2\. myContract.methods.myMethod().call()
call - 调用合约方法
调用合约的只读方法，并在EVM中直接执行方法，不需要发送任何交易。因此不会改变合约的状态。
调用：
```
myContract.methods.myMethod([param1[, param2[, ...]]]).call(options[, callback])
```
参数：
- options - Object : 选项，包含如下字段：
  from - String (optional): The address the call “transaction” should be made from.
  gasPrice - String (optional): The gas price in wei to use for this call “transaction”.
  gas - Number (optional): The maximum gas provided for this call “transaction” (gas limit).
- callback - Function : 可选的回调函数，其第二个参数为合约方法的执行结果，第一个参数为错误对象

3\. myContract.methods.myMethod().send()
向合约发送交易来执行指定方法，将改变合约的状态。
调用：
```
myContract.methods.myMethod([param1[, param2[, ...]]]).send(options[, callback])
```
参数：
- options - Object: 选项，包含如下字段：
  from - String: 交易发送方地址
  gasPrice - String : 可选，用于本次交易的gas价格，单位：wei
  gas - Number : 可选，本次交易的gas用量上限，即gas limit
  value - Number|String|BN|BigNumber: 可选，交易转账金额，单位：wei
- callback - Function: 可选的回调参数，其参数为交易哈希值和错误对象

4\. web3.utils.sha3
使用web3.utils.sha3()方法计算给定字符串的sha3哈希值。

注意，如果要模拟solidity中的sha3，请使用soliditySha3函数。

调用：
```
web3.utils.sha3(string)
web3.utils.keccak256(string) // ALIAS
```
参数：
- string - String: 要计算sha3哈希值的字符串

返回值：
- String: 计算结果哈希值

### CP-ABE
由于时间关系，CP-ABE算法没有引入。