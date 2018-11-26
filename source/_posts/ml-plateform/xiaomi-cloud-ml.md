---
layout:     post
title:      小米深度学习平台cloud-ml
date:       2018-10-25 09:00:00
author:     "banban"
header-img: "/images/ml-plateform/cloud-ml/bg.png"
catalog: true
tags:
    - 深度学习平台
---

## Xiaomi Cloud-ML简介

小米云深度学习服务，简称Xiaomi Cloud-ML，是小米生态云针对机器学习优化的高性能、分布式云服务。

开发者可以在云端使用GPU训练模型，秒级启动分布式训练任务，兼容TensorFlow等深度学习框架，也可以一键部署训练好的模型，或者创建基于GPU的开发环境，提供模型开发、训练、调优、测试、部署和预测一站式解决方案。云深度学习服务还开放了API、SDK、命令行和Web控制台等多种访问方式，支持灵活的秒级计费，方便人工智能专家使用。

## Xiaomi Cloud-ML特性

**易用性**

支持简单易用的命令行工具，可在Linux/Mac/Windows操作系统或者Docker中运行，也可以通过API、SDK或者Web控制台使用云深度学习服务。

**兼容性**

支持TensorFlow等深度学习框架的标准API，兼容Google CloudML的samples代码，相同模型代码可在不同云平台上训练，避免厂商绑定。

**高性能**

支持超高性能GPU运算，最大可支持56核CPU和128G内存，支持数据并行和模型并行、单机多卡和多机多卡的分布式训练。

**灵活性**

支持按需申请和分配CPU、内存和GPU资源，可根据任务运行时间实现秒级别的计量计费功能。

**安全性**

支持基于Access key/Secret key的多租户认证授权机制，可在线动态调整用户Quota配额。

**完整性**

支持云端训练，用户编写好代码一键提交到云端训练，支持基于CPU或GPU训练，支持17个主流深度学习框架和超参数自动调优等功能。

支持模型服务，用户训练好的模型可以一键部署到云平台，对外提供通用的高性能gRPC服务，支持模型在线升级和多实例负载均衡等功能。

支持开发环境，用户可以在平台创建TensorFlow等深度学习开发环境，自动分配CPU、内存和GPU资源，支持Notebook和密码加密等功能。

## 一个基于云构建深度学习平台的基本特性
- 屏蔽硬件资源保证开箱即用

- 缩短业务环境部署和启动时间

- 提供“无限”的存储和计算能力

- 实现多租户隔离保证数据安全

- 实现错误容忍和自动故障迁移

- 提高集群利用率和降低性能损耗

- 支持通用GPU等异构化硬件

- 支持主流的深度学习框架接口

- 支持无人值守的超参数自动调优

- 支持从模型训练到上线的工作流

## 需求

- 多租户
- 任务隔离
- 资源共享
- 支持多框架
- 支持GPU

## cloud-ml平台特点
- 任务调度和物理机管理基于多节点的分布式Kubernetes集群
- 对于OpenStack、Yarn和Mesos保留了实现接口
- 支持17个主流的深度学习框架
- 实现了分布式训练
- 超参数自动调优
- 前置命令
- NodeSelector
- Bring Your Own Image
- FUSE集成
- 自定义了API server实现授权认证和Quota功能

## 平台整体架构

![image](/images/ml-plateform/cloud-ml/cloud-ml-arch.png)

## 深度学习功能主要包含
- 开发
- 训练
- 调优
- 测试
- 部署
- 预测

## 用户输入
- ps参数服务器个数
- worker个数
- tensorflow编写的代码

例如下面的云深度学习平台分布式训练

![image](/images/ml-plateform/cloud-ml/cloud-ml-arch-2.png)    

## 总结

本文介绍了实现企业级云深度学习平台需要的概念和知识，基于小米cloud-ml服务探讨了云平台的设计、架构、实现以及实践这四方面的内容。

小米的cloud-ml主要实现的功能包含

- 顶层通过API、SDK的形式提供深度学习资源调度服务、模型训练服务等，用户只需要通过提交ps/worker/Tensorflow code既可实现分布式深度学习，简单易用

- 在认证和配额上面，cloud-ml自定设计了API Server，采用了AKSK的签名机制，保证认证授权，同时参考OpenStack的多租户和Quata配额机制，实现了Kubernetes上的配额机制

- cloud-ml采用Kubernetes集群实现容器资源/GPU等异构计算资源的调度，同时设计了NodeSelector模块进行GPU粒度调度

- 高可用方面cloud-ml采用了Etcd，能够实现训练过程中出现异常或者错误，能够及时恢复训练任务。同时实现在分布式环境下各个深度学习组件不会出现单点故障

## 参考文献
[**小米云深度学习平台的架构设计与实现**](https://juejin.im/entry/594a2a69ac502e5490f95740)   

[**cloud-ml官方文档**](http://docs.api.xiaomi.com/cloud-ml/ )