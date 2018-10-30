---
layout:     post
title:      310 BITCOIN CHALLENGE
date:       2018-10-15 10:32:00
author:     "banban"
header-img: "/images/blockchain/bitcoin/challenge/bg.png"
catalog: true
tags:
    - Blockchain
    - Bitcoin
---

## 前言

区块链已经进入了发展的蓬勃期，公有链项目不管是欺骗人的或者是真正在做事的，已经越来越多了，虽然有很多“跑路”项目割了很多韭菜，但是目前以`BTC`带头的主流项目仍在不断发展。而区块链也被认为是黑客的“提款机”，不断爆出的黑客盗币时间让很多交易所、持币者战战兢兢。

曾经，智力超群的黑客们在搞破坏之余也爱玩些行为艺术。可当互联网被垄断后，黑客们捧起了保温杯，去500强上班领工资，就这样，我们失去了古典互联网和极客艺术家。十几年过去，他们又以另一种姿态重新在区块链世界登场，秉承极客精神，用财富、艺术和技术挑战编程想象力的极限。他们有了标榜身份的新玩具——加密艺术品。

近日，链圈又诞生了一条数字锦鲤，一名匿名土豪网友发起了一个游戏，宣布将310枚比特币藏在了下面这幅画中。

![](/images/blockchain/bitcoin/challenge/challenge.png)

游戏地址：https://bitcoinchallenge.codes/

这款解密游戏共有4关，第一关0.1BTC，第二关0.2BTC，第三关0.31BTC，第四关310BTC按照当前的行情，相当于在这幅灰突突的画上贴了1400万人民币，请诸位玩家凭能力自取。这个游戏的发布者匿名自称为`Bip`，他是早起比特币的玩家，用家里的台式机挖取了大量的比特币，数量未知。

所有的奖励的存币地址如下
310 BTC
https://blockexplorer.com/address/39uAUwEFDi5bBbdBm5ViD8sxDBBrz7SUP4
0.31 BTC
https://blockexplorer.com/address/3NPZiNWiD7cCfXZa1D8tnEZBPgQ884cVw7
0.2 BTC
https://blockexplorer.com/address/1G7qsUy5x9bUd1pRfhVZ7cuB5cMUP4hsfR
0.1 BTC
https://blockexplorer.com/address/1446C8HqMtvWtEgu1JnjwLcPESSruhzkmV

## 0.1 BTC 破解

游戏在`2018-10-02`发布，很快在`2018-10-04`就有玩家破解了第一关，这一关玩家能够赢取0.1BTC，那么是怎么破解的呢？

其实整张图最明显的地方就是这个位置
![](/images/blockchain/bitcoin/challenge/01btc.jpg)

这是一个 `3*6`的表格，看起来是一些16进制的数字，而且表格右下角也有一个模糊的16，应该是提示这个是16进制的。在表格的正上方，我们会发现又一个灰色的日期“OCT 2 2018”，根据解密的经验，从最简单的移位密码开始，因此把`20181002`作为`shift key`，发现能够得到表格数字如下

```
310 310 310 310 310 310
1AA 0FC 32D 5FF 78F 643
42C 5C7 490 2F4 36E 43B
```

第一行全部是`310`!

这个和大奖的金额完全相同，可以理解我们这个是正确的解法的一个小提示。那么剩下的12个16进制的数字表示什么呢？

这边解释一下这个移位密码是怎么做的，并且贴上python代码，一目了然

```
  511 B20 332 328 410 530
- 201 810 022 018 100 220
-------------------------
  310 310 310 310 310 310
```

移位解密程序
```
# coding:utf-8
__author__ = 'banban'

import sys

string = '511b2033232841053022b0fe52ed0f7a165b52c7e75112f656fc4b'
key = '20181002'
hexadecimal = '0123456789abcdef'

new_string = []
for i in range(len(string)):
	string_char = string[i]
	key_char = key[i % len(key)]
	string_index = hexadecimal.index(string_char)
	key_index = hexadecimal.index(key_char)

	new_char_index = (string_index - key_index) % len(hexadecimal)
	new_char = hexadecimal[new_char_index]
	new_string.append(new_char)

new_string = "".join(new_string)

new_list = []

for i in range(0, len(new_string), 3):
	new_list.append(new_string[i : i+3])

print(" ".join(new_list))

print(new_list[6:])

print([int(x, 16) for x in new_list[6:]])
```

将上面得到的12位16进制转化成10进制试试吧
```
426 252 813 1535 1935 1603
1068 1479 1168 756 878 1083
```

这12个数字代表什么呢？这边就需要说一下BTC里面的`bip`标准了，为了让一个用户的钱包私钥有另一种存储形式，BTC引入了助记词，助记词一般就是12个常见单词，这些单词可以在bitcoin的代码里面找到

https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt

这里面有2048个助记词，可以认为是一个字典。而我们刚得到的12为数字都没有超过2048，可以认为这个其实就是助记词的序号。

进而可以得到助记词如下：
```
cry buyer grain save vault sign lyrics rhythm music fury horror mansion
```
其实这个时候机已经获得了这个钱包的所有权了，只需要将这个助记词复制到`imToken` 钱包中导入BTC钱包即可转走0.1BTC

同时我们也可以用一些工具转化得到这个钱包的私钥

https://iancoleman.io/bip39/

这个工具用于从助记词获得私钥，适用于非常多的Coin比如：BTC、ETH、ZEN等等。最终私钥就是
```
KzkZxdhRGxB7eX4u1skXkfJ7VB8JfPp7Nfos3jiF7PQUNMh2SHDE
```
![](/images/blockchain/bitcoin/challenge/01btcgot.png)

从该地址我们可以看到 0.1BTC 已经在10月4日被 1AuSap3Z9NhmhQEe3y1ByxuNFY1S35YtZ3 这一位解密高手领走。具体可以查看 

https://blockexplorer.com/address/1446C8HqMtvWtEgu1JnjwLcPESSruhzkmV

**到此为止，以上就是0.1BTC谜题的解密过程**

## 魔牛财经50ETH

既然掀起了这么一股热潮，国内一家初创公司魔牛财经也发起了类似310BTC的挑战，这个挑战的图如下

![](/images/blockchain/bitcoin/challenge/moniu_challenge.jpg)

这张图是直接通过公众号以及微信群转发的，我们知道微信转发过程是会导致图片损失的，而且图片以jpg的格式呈现，因此图片在清晰度上比 310BTC 挑战差很多

本人就着 310BTC 挑战的方式去解密这张图

首先是这个最显眼的就是告诉我们这个ETH的区块链浏览器链接：https://etherscan.io/address/0xbf0aa38b0199eb2a6a9ffaa10e93d5811538bb1d

打开之后会看到这次的挑战奖池有50个ETH，虽然没有310BTC那么诱人，但是也不失为一个很有意思的挑战

放大图片我们会发现在图片的右边有一个网址： http://www.moniu.com/

我们打开这个网址发现是魔牛财经的官方网站，而其中包含了一个`Bitcoin whitepaper's 10th Anniversary`的推荐，本着好奇点击开来，发现这个跳转到了 BTC 的行情监控页面。这太奇怪了！欲盖弥彰的感觉。

![](/images/blockchain/bitcoin/challenge/moniu_tuijian.png)

回到挑战图我们仔细看刚刚那个网址旁边，有一个人头，虽然有点模糊，但是回到魔牛财经的官方首页会发现那个推荐的配图其实右下角也有一个类似的人，因而仔细观察挑战图会发现上方有THE TIMES的字眼，那张图的原图应该就是这张配图

![](/images/blockchain/bitcoin/challenge/moniu_fenxi1.png)

于是我们的任务就是得到这张配图，使用浏览器的“审查元素”工具，直接按 F12 回去图片的资源链接，于是能得到图片链接为：http://res.moniu.com/home/ad/btc_bannerhot.jpg
![](/images/blockchain/bitcoin/challenge/btc_bannerhot.jpg)

That's it!

由于这张报纸其实是非常有名的一张报纸，是来自于2009年1月3日英国《泰晤士报》，其中一篇报道标题 `Chancellot on brink of second bailout for banks`直译为“财政大臣正处于实施第二轮银行紧急援助的边缘”。同时献上原图

![](/images/blockchain/bitcoin/challenge/taiwushibao.jpg)

这段历史发生在08年全球金融危机的背景下，大量的银行因为次级抵押贷款的滥用受到损失甚至破产，而中本聪在创世区块留下这一段信息可以解读为是“讽刺中心化的金融机构，在经济危机之下，银行失去了信用”。

而我们对比原图和魔牛财经官方网站首页的那张隐藏图，会发现有一个地方被修改了

![](/images/blockchain/bitcoin/challenge/moniu_fenxi2.png)

这个套路不就是`310BTC`中的类似吗？是的，而且这边有一个有趣的现象就是好像并不需要以为就可以, 因为魔牛的隐藏图中的18个16进制如下
```
32  32  32  32  32  32
295 39c 2f  3c  50  5a
8   af  3d  261 ea  7f
```

转化为10进制为
```
50  50  50  50  50  50
661 924 47  60  80  90
8   175 61  609 34  127
```
会看到第一行全是50，是不是我们就找到了答案呢？使用后面12为数字得到的助记词组合是
```
family inflict alarm alter antique arctic abstract beyond always equal brush average
```

我们放到校验平台 https://iancoleman.io/bip39/

无效的助记词！Invalid mnemonic！

显然不可能这么简单就得到答案。本人还没有寻找到最终的解，这边也po出一些自己的破解过程，同时我在破解过程中竟然得到了好几组有效的助记词

### 破解思路1

将上面解答得到的无效助记词进行整体后移，与计算机里面的`mod`类似，超过范围的就`mod 12`，会得到两个有效的助记词，但是并不是答案，而且这种做法比较没有根据，属于一种尝试！因此这种做法是不可取的
```
antique arctic abstract beyond family inflict alarm alter always equal brush average

abstract beyond always equal brush average family inflict alarm alter antique arctic
```

这两个助记词对应的`address`分别是

`0x8E5bacFed41a88D2Fa95CD1eF9Fbccc23132352c`

`0xa2859bfccE5df7b9A92F474CfE72fBdceB1BB99A`

### 破解思路2
由于挑战图里面有几个非常清晰的数字`09`、`01`、`03`，这个其实就是这张报纸的发布日期，会想到和`BTC310`中`0.1BTC`哪一关的挑战类似，因为已经得到了包含`50`的结果了，因此考虑使用20190103作为一个整体移动的`key`，超出部分`mod 2048`即可，代码如下

```
# coding:utf-8
__author__ = 'banban'

import sys

moniu = ['32', '32', '32', '32', '32', '32', '295', '39c', '2f', '3c', '50', '5a', '8', 'af', '3d', '261', 'ea', '7f']

index = [int(x, 16) for x in moniu[6:]]

index2 = []
for i in range(len(index)):
	a = (index[i] + 20090103) % 2048
	index2.append(a)

result=[]
with open('english.txt','r') as f:
	for line in f:
		result.append(line.strip('\n'))

seeds = []
for i in range(len(index2)):
	seeds.append(result[index2[i] - 1])

print(index)
print(index2)
print(" ".join(seeds))
```
我们可以得到有效助记词
```
vapor banner pigeon play potato present panther regret please turtle rose push
```
这个助记词对应的私钥是
```
0x67c15375d3698582015289969f6b32f95d18566713ed0e919870e5a471ceefd2
```
钱包地址
```
0x153Fd090b27e898A599010aeD8e881E7b39538A8
```
不是正解！

### 破解思路3
接下来这个助记词的破解我没有记录过程，但是这个有效助记词对应的地址也不是正解，因此可以忽略
```
fabric inch again alien angle anxiety zone believe all enough bright attitude
```
对应的钱包地址是
```
0x2f4591A729614831445BaA3Fe74E24Dd701822e9
```

### 破解思路4
使用`20090103`进行移位

移位做法如下
```
  295 39c 2f 3c 50 5a 8 af 3d 261 ea 7f
- 200 901 03 20 09 01 0 32 00 901 03 20
---------------------------------------
  095 99b 2c 1c 5f 59 8 7d 3d 860 e7 5f
to dec
---------------------------------------
  149 2459 44 28 95 89 8 125 61 2144 231 95
% 2048
---------------------------------------
  149 411 44 28 95 89 8 125 61 96 231 95
seeds
----------------------------------------
  barely damage air address armed arch abstract auto always armor broom armed
```

有两个数字都是超过了2048的，所以取模一次2048，但是其实看到有两个一样的单词就知道这种做法肯定是错的，因此移位20090103是不可取的

当然这个助记词是合法的，得到的`address`是

`0x7A781AA0a2C868bD8C451DCe0956095b677031B2`

### 破解一手资料

魔牛财经网站：http://www.moniu.com/
魔牛隐藏图地址：http://res.moniu.com/home/ad/btc_bannerhot.jpg
奖金地址：https://etherscan.io/address/0xbf0aa38b0199eb2a6a9ffaa10e93d5811538bb1d
bip39校验：https://iancoleman.io/bip39/
bip32插件 [Dead-simple BIP32 (HD) wallet creation for BTC](https://github.com/ranaroussi/pywallet)
《泰晤士报》正面原图：http://i.imgur.com/TZlCjqj.jpg
《泰晤士报》背面原图：http://i.imgur.com/muK98gm.jpg
古典密码集合：https://gist.github.com/0kami/ffd15270914492491e18ff9f070eab2b

### 常用密码工具
[Substitution Solver](https://www.guballa.de/substitution-solver)
[XOR Calculator](http://xor.pw/#)
[dCode.fr](https://www.dcode.fr/)

## 总结

这种密码挑战破解得到代币的游戏很有趣，但是确实还是难度比较高了，而且破解过程会耗费比较大量的时间，因此建议不要沉迷。有空玩一玩还是可以的，可以趁机学习不少密码学的东西。

Learn Anytime！