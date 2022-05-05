---
layout:     post
title:      MongoDB 笔记
author:     "banban"
header-img: "/images/essay/hello-world-bg.jpg"
catalog: true
tags:
    - Big Data
    - MongoDB
---
## 最佳实践

传送门：[《50 Tips and Tricks for MongoDB Developers》](https://pepa.holla.cz/wp-content/uploads/2016/07/50-Tips-and-Tricks-for-MongoDB-Developers.pdf)

### 速度优先使用嵌入数据，完整性优先使用引用数据

**规范化架构**

```json
{
     "_id" : productId,
     "name" : name,
     "price" : price,
     "desc" : description
}

{
    "_id" : orderId,
    "user" : userInfo,
    "items" : [
        productId1,
        productId2,
        productId3
    ]
}
```

**非规范化架构**

```json
{
  "_id" : productId,
  "name" : name,
  "price" : price,
  "desc" : description
}

{
​    "_id" : orderId,
​    "user" : userInfo,
​    "items" : [
​        {
​            "_id" : productId1,
​            "name" : name1,
​            "price" : price1
​        },
​        {
​            "_id" : productId2,
​            "name" : name2,
​            "price" : price2
​        },
​        {
​            "_id" : productId3,
​            "name" : name3,
​            "price" : price3
​        }
​    ]
}
```

### 合理建立索引

数据示例
```json
{
    "_id": ObjectId('xxx'),
    "threadId": 123,
    "data": ISODate("2022-04-13")
}
```
查询语句
```bash
db.posts.find({"threadId" : id}).sort({"date" : 1}).limit(20)
```
业务经常需要这种数据分页式查询，则可以建立索引
```bash
db.posts.createIndex({'threadId' : 1, 'date' : 1}, {'background': true})
```

### 尽可能预填充已知内容

例如某一条记录是用于记录一天内固定的6个小时的访问情况
```json
{
​    "_id" : pageId,
​    "start" : time,
​    "visits" : {
​        "minutes" : [
​            [num0, num1, ..., num59],
​            [num0, num1, ..., num59],
​            [num0, num1, ..., num59],
​            [num0, num1, ..., num59],
​            [num0, num1, ..., num59],
​            [num0, num1, ..., num59]
​        ],
​        "hours" : [num0, ..., num5] 
​    }
}
```
则对于那些仍未发生的内容，可以用缺省值先填充
```json
{
​    "_id" : pageId,
​    "start" : someTime,
​    "visits" : {
​        "minutes" : [
​            [0, 0, ..., 0],
​            [0, 0, ..., 0],
​            [0, 0, ..., 0],
​            [0, 0, ..., 0],
​            [0, 0, ..., 0],
​            [0, 0, ..., 0]
​        ],
​        "hours" : [0, 0, 0, 0, 0, 0]
​    }
}
```
MongoDB不需要为新内容寻找空间，它只是更新已经输入的值，这样会快很多。

例如，在小时开始时，程序可能会执行以下操作：
```bash
> db.pages.update({"_id" : pageId, "start" : thisHour}, 
... {"$inc" : {"visits.0.0" : 3}})
```

### 尽可能预聚合

例：提前把 total 值算好，MongoDB 是很笨重的数据库，对简单的检索效率很高，但是在数据量大的情况下做很复杂的聚合，性能会随着复杂度提升而降低。
```bash
> db.food.update(criteria, {"$inc" : {"apples" : 10, "oranges" : -2, "total" : 8}})
> db.food.findOne()
{
    "_id" : 123,
    "apples" : 20,
    "oranges" : 3,
    "total" : 23
}
```


MongoDB提供了以下Read Preference Mode：

- ***primary***：默认模式，一切读操作都路由到replica set的primary节点
- ***primaryPreferred***：正常情况下都是路由到primary节点，只有当primary节点不可用（failover）的时候，才路由到secondary节点。
- ***secondary***：一切读操作都路由到replica set的secondary节点
- ***secondaryPreferred***：正常情况下都是路由到secondary节点，只有当secondary节点不可用的时候，才路由到primary节点。
- ***nearest***：从延时最小的节点读取数据，不管是primary还是secondary。对于分布式应用且MongoDB是多数据中心部署，nearest能保证最好的data locality。


## 踩坑记录

### 配置足够多的 Mongos 实例

在一些业务下，会频繁请求后端并读取 Mongo 数据。对于这种业务切忌增加耗时的操作

```python
def get_method():
    # 这边通过 Mongo 获取数据
    data = self.mongo_service.get()

    # 这边有一个耗时的数据处理，例如从别的系统获取数据
    self.combine_data_from_http(data)

    return data
```
