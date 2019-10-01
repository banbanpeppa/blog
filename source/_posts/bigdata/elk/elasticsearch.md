---
layout:     post
title:      Elasticsearch的安装与使用
author:     "banban"
header-img: "/images/bigdata/elk/elk_bg.png"
catalog: true
tags:
    - Big Data
    - ELK
---

# Elasticsearch

![image](/images/bigdata/elk/elk.jpg)

## ~~Getting Started~~

Elasticsearch是一个高可扩展的开源全文检索和分析引擎。它提供了快速实时进行存储、查询和分析海量数据的功能。这个工具通常用于那些需要复杂查询功能和需求的场景，我们将Elasticsearch作为一个底层引擎技术来驱动顶层应用。

以下是一些简单的使用Elasticsearch的用例

* 在一个在线电商平台中，需要允许用户对不同的商品进行搜索，商品的种类繁多，需要能够及时返回比较精准的结果。这个时候就可以使用Elasticsearch来存储所有商品的分类和清单，之后Elasticsearch来提供其强大的搜索功能。
* 在一些场景下，用户想要对大量的日志文件进行分析，从中的得到一些关于产品的使用趋势、统计结果以及一些异常情况，以此来进一步驱动产品进步。在这种情况下，用户可以使用Logstash（ELK的L）来对日志进行采集、聚合和解析，之后Logstash将处理好的日志落到Elasticsearch，只要数据落到了Elasticsearch，用户便可以使用它的强大的搜索和聚合功能来获取自己想要的结果内容。
* 在用户使用某一个电商平台的过程中，可能用户对某一个商品感兴趣，但是可能用户暂时不能接受当前价格，这时候用户可能希望设置一个阈值，在商品价格降低到对应这个价格的时候就通过某种方式通知用户，用户能够在第一时间获取得到该商品降价的信息。这个可以通过Elasticsearch来实现，Elasticsearch通过其反向查询的能力，对商品价格进行查询，当价格满足了条件既可以通过告警系统将消息发送给用户。
* 在一些场景下，用户会需要对大量的数据进行快速审查、分析以及获取数据的可视化结果，可以使用Elasticsearch进行数据存储，使用Kibana来对数据进行显示，Kibana是一个数据可视化的dashboard，它可以展示一系列对用户来说很重要的数据，用户可以定制对应显示的数据内容。另一方变，用户还可以使用Elasticsearch强大的聚合能力来进行复杂得多商业数据查询。

## Introduction

Elasticsearch是Elastic Stack（简称ES）的核心分布式检索和分析组件，Logstash和Beats主要用于将数据进行采集、聚合以及处理数据，然后将数据存储到Elasticsearch，Kibana则将处理好的数据进行可视化，并且对数据进行一些操作与监控。而那些索引、检索以及分析的核心功能都是在Elasticsearch中完成的。

Elasticsearch提供了实时检索与分析数据的能力，不管是结构化的数据还是非结构化的数据、数字化数据、地理数据等，Elasticsearch都能够高效地进行存储并建立索引，同时实现高效检索能力。用户可以远远超出简单的检索和聚合信息，以发现数据中的趋势和模式，达到数据分析的目的。随着数据和查询量的增长，Elasticsearch的分布式特性使得部署能够随之无缝增长，实现动态扩展的能力。

在现实业务中，显然不是每一个问题都是搜索问题，但是Elasticsearch提供了处理各种数据的速度和灵活性，以下是一些用例：

* 将搜索框添加到应用或者网站中，这个时候可以使用ES
* 存储和分析日志、指标和安全事件数据
* 使用机器学习手段来自动模型化实时数据的行为
* 只用Elasticsearch作为全自动化商务流程的引擎
* 把Elasticsearch作为GIS来管理、集成和分析地理数据

## 基本概念

在Elasticsearch中有一些核心概念，掌握这些概念有助于对Elasticsearch的理解。

### NRT（Near Realtime）近实时

Elasticsearch是一个近实时的搜索平台，也就是说Elasticsearch在对某一个文档建立好index之后到进入可搜索阶段会有一个时延（通常是一秒钟）。

### Cluster

集群通常指的是由一台或者多台服务节点组成的节点，这些节点存储了完整的数据内容，并且对这些数据提供了联合索引，用户可以通过所有的节点进行数据检索。一个集群通常会由一个独一的名称进行标识（默认使用“elasticsearch”），这个名称很重要，一个节点在加入了某一个名称的集群之后，只能属于某一个集群。

所以在一些环境下，要确保针对不同的集群没有使用相同的名称，否则可能就会出现一些节点加入错误的情况。例如，用户可以定义名为`logging-dev`、 `logging-stage`或者`logging-prod`的名字来区分不同的es集群。

需要注意的是，一个集群是完全支持只存在一个节点的情况的。

### Node

一个节点就是一个集群的一部分，节点存储了数据，参与到一个集群中提供其索引和搜索的能力。同集群有点类似，一个节点由一个UUID来标识，如果不想使用UUID，用户可以自顶一个名称来标识节点。

一个节点可以通过配置加入到某一个特定的集群中，默认一个节点直接加入到名为”elasticsearch“集群中。假设在一个分布式环境下，有一些es节点启动并且能够相互发现，他们会自组织形成一个名为`elasticsearch`的集群，并加入到这个集群中。

在一个集群下，可以容纳任意多的节点。

### Index

Index是一系列有相同或者相似特征的文档，例如对于用户数据，可以为其定义一个`customer index`，对于商品类目，可以定义另一个index为`catagory`，一个index由一个名称来表示，而这个index会在后续的索引、检索、更新以及删除文档等操作的时候使用。

在一个单独的集群中，可以为文档定义任意多的index。

### ~~Type （6.0.0版本之后弃用)~~

在一个index下面的逻辑分区，能够将不同类型的文档归类到同一个index下面。例如，一个文档类型是`users`的类型，另一类的文档类型是`blog posts`类型，这两个类型可以放在同一个index的不同分区下面，也就是不同的type下面。

这个概念在后续的es版本中已经弃用了。具体可以参考[Removal of mapping types](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/removal-of-types.html)。

### Document

在前面有提到文档的概念，一个文档是一个能够被index的最小单元，例如可以为一个单独的顾客定义一个文档，也可以为一个单独的商品定义一个文档。这个文档通常是用JSON来表示。

在一个index或者type下，可以存储任意多的文档，需要注意的是，一个文档虽然物理位置上面来说是在一个index下面的，但是一个文档必须详细分配到index下面的某一个type下。

### Shards & Replicas

在一个index下面可能会存储非常大量的文档（数据），这些数据有可能会超出一个节点的硬件限制。例如，在一个单独的index下面有超过1TB的文档，这个可能会超过一个节点的磁盘容量或者可能会导致查询的效率非常的慢。

为了解决这个问题，Elasticsearch将index进行再分割为一个一个shards（分片），当定义了一个index的时候，用户可以指定对应的shards（分片）数，每个分片本身都是一个功能齐全且独立的“索引”，可以托管在集群中的任何节点上。

分片之所以很重要有两个很重要的原因：

* 分片允许用户水平分割或者水平扩展内容卷
*  允许用户跨分片（分片可能分布在不同的节点上面）分布和并行化操作，进而提高系统的性能和吞吐量

在一个复制的分布式环境或者云环境中，不可预期的一些故障是可能出现的，为此强烈建议使用Elasticsearch提出的故障转移机制，以防止某一个节点因为宕机或者其它一些原因不可用而导致数据丢失。Elasticsearch允许对每一个分片都进行副本复制，称为分片副本。

副本很重要的原因主要有两个：

* 可以在分片或者节点出现故障的时候提供系统的可用性，因此需要注意副本分片需要与原始分片分布在不同的节点上面。
* 能够实现扩展的搜索量和吞吐量，因为可以在所有的副本上面（包括原始分片）进行并行搜索。

总而言之，每一个index（索引）的都可以划分为多个分片，同时针对每一个索引都可以为其分片进行副本复制，复制之后，每个索引都将具有朱分片和副本分片。在创建index的时候可以为每一个index定义分片和副本的数目，创建索引之后，用户可以动态地更改副本数，但是不能修改分片数目。

默认情况下，Elasticsearch中的每个索引都会有5个主分片和一个副本，这就因为这在集群中至少需要两个节点（副本要和主分片在不同节点），即索引会包含5个主分片和5个副本分片，总计每个索引10个分片。

## Installation

本人在进行实验的时候Elasticsearch的最新版本是`7.3.2`，视情况而定下载对应的镜像，具体镜像在[www.docker.elastic.co](https://www.docker.elastic.co/)。

设置镜像的版本号
```
export ELK_VERSION=7.3.2
```
### docker run
用docker方式来安装会比较快捷方便，接下来主要通过`docker run`的方式来部署一个ES集群。

#### Elasticsearch

![image](/images/docker/docker-tiny.png)

下载镜像
```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:${ELK_VERSION}
```

使用docker run的方式启动
```bash
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -it -d --name es-node docker.elastic.co/elasticsearch/elasticsearch:7.3.2
```

#### Kibana

Kibana是ELK的dashboard，可以通过Kibana实现数据的可视化，对数据进一步分析。

拉取Kibana的镜像
```bash
docker pull docker.elastic.co/kibana/kibana:${ELK_VERSION}
```

启动Kibana服务的方式也有两种，一种是通过docker run的方式，另一种是通过docker-compose的方式。

首先介绍docker run的方式。
```bash
docker run --link YOUR_ELASTICSEARCH_CONTAINER_NAME_OR_ID:elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:${ELK_VERSION}
```
这里运行成功的前提是elasticsearch容器启动的时候网络用的是default，否则需要制定对应的网络。

在运行的过程中，由于Kibana服务的启动过程中有很多参数可以设置，为此不建议通过环境变量一个一个写，可以通过挂载的方式将`kibana.yaml`的配置文件挂载过去，`kibana.yaml`配置文件(7.3版本)的具体配置要求在这个[链接](https://www.elastic.co/guide/en/kibana/7.3/settings.html)

则启动方式添加参数
```bash
docker run --link YOUR_ELASTICSEARCH_CONTAINER_NAME_OR_ID:elasticsearch -p 5601:5601 -v ./kibana.yml:/usr/share/kibana/config/kibana.yml docker.elastic.co/kibana/kibana:${ELK_VERSION}
```

### docker-compose

#### Elasticsearch
可以通过docker-compose的方式启动,docker-compose的yaml文件如下

`elasticsearch.yaml`
```yaml
version: '3'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELK_VERSION}
    container_name: es01
    environment:
      - node.name=es01
      - discovery.seed_hosts=es02
      - cluster.initial_master_nodes=es01,es02
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - esnet
  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELK_VERSION}
    container_name: es02
    environment:
      - node.name=es02
      - discovery.seed_hosts=es01
      - cluster.initial_master_nodes=es01,es02
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata02:/usr/share/elasticsearch/data
    networks:
      - esnet

volumes:
  esdata01:
    driver: local
  esdata02:
    driver: local

networks:
  esnet:
```
另外将镜像的版本添加到`.env`文件中（和elasticsearch.yaml文件同一个目录)

`.env`
```ini
ELK_VERSION=7.3.2
```

然后直接执行
```bash
docker-compose -f elasticsearch.yaml up -d
```

创建好之后查看docker容器运行情况
```bash
# docker ps -a

CONTAINER ID        IMAGE                                                              COMMAND                  CREATED             STATUS              PORTS                              NAMES
4b8cc899cb3f        docker.elastic.co/elasticsearch/elasticsearch:7.3.2                "/usr/local/bin/do..."   6 minutes ago       Up 6 minutes        9200/tcp, 9300/tcp                 es02
992ed17bfeb9        docker.elastic.co/elasticsearch/elasticsearch:7.3.2                "/usr/local/bin/do..."   6 minutes ago       Up 6 minutes        0.0.0.0:9200->9200/tcp, 9300/tcp   es01
```
访问Elasticsearch的接口
```bash
$ curl http://127.0.0.1:9200/_cat/health
1568624275 08:57:55 docker-cluster green 2 2 0 0 0 0 0 0 - 100.0%
```
安装成功

#### Kibana
结合之前的elasticsearch容器启动，追加内容得到

`elasticsearch.yaml`
```yaml
version: '3'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELK_VERSION}
    container_name: es01
    environment:
      - node.name=es01
      - discovery.seed_hosts=es02
      - cluster.initial_master_nodes=es01,es02
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - esnet
  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELK_VERSION}
    container_name: es02
    environment:
      - node.name=es02
      - discovery.seed_hosts=es01
      - cluster.initial_master_nodes=es01,es02
      - cluster.name=docker-cluster
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - esdata02:/usr/share/elasticsearch/data
    networks:
      - esnet
  kibana:
    image: docker.elastic.co/kibana/kibana:${ELK_VERSION}
    container_name: kibana
    environment:
      SERVER_NAME: testing-chenzhiling.loghub.netease.com
      ELASTICSEARCH_HOSTS: http://es01:9200
    ports:
      - 5601:5601
    links:
      - 'es01:es01'
    networks:
      - esnet

volumes:
  esdata01:
    driver: local
  esdata02:
    driver: local

networks:
  esnet:
```
然后执行
```bash
docker-compose -f elacticsearch.yaml up -d
```
启动成功之后访问 http://127.0.0.1:5601 可以进入Kibana的界面
![image](/images/bigdata/elk/kibana_dashboard.png)
