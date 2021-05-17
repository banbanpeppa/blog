---
layout:     post
title:      Logstash性能调优
author:     "banban"
header-img: "/images/bigdata/elk/elk_bg.png"
catalog: true
tags:
    - Big Data
    - ELK
---

# Logstash性能调优
[详细调优参考](https://www.elastic.co/guide/en/logstash/current/performance-tuning.html)

## Inputs和Outputs的性能
当输入输出源的性能已经达到上限，那么性能瓶颈不在Logstash，应优先对输入输出源的性能进行调优。  
## 系统性能指标：
- CPU
  - 确定CPU使用率是否过高，如果CPU过高则先查看JVM堆空间使用率部分，确认是否为GC频繁导致，如果GC正常，则可以通过调节Logstash worker相关配置来解决。
- 内存
  - 由于Logstash运行在JVM上，因此注意调整JVM堆空间上限，以便其有足够的运行空间。另外注意Logstash所在机器上是否有其他应用占用了大量内存，导致Logstash内存磁盘交换频繁。
- I/O使用率
1）磁盘IO：
    磁盘IO饱和可能是因为使用了会导致磁盘IO饱和的创建（如file output）,另外Logstash中出现错误产生大量错误日志时也会导致磁盘IO饱和。Linux下可以通过iostat, dstat等查看磁盘IO情况
2）网络IO：
    网络IO饱和一般发生在使用有大量网络操作的插件时。linux下可以使用dstat或iftop等查看网络IO情况
3）JVM堆检查：    
```
1、如果JVM堆大小设置过小会导致GC频繁，从而导致CPU使用率过高  
2、快速验证这个问题的方法是double堆大小，看性能是否有提升。注意要给系统至少预留1GB的空间。  
3、为了精确查找问题可以使用jmap或VisualVM。[参考](https://www.elastic.co/guide/en/logstash/current/tuning-logstash.html#profiling-the-heap)
4、设置Xms和Xmx为相同值，防止堆大小在运行时调整，这个过程非常消耗性能。
```
4）Logstash worker设置：
worker相关配置在logstash.yml中，主要包括如下三个：
  - pipeline.workers：
  该参数用以指定Logstash中执行filter和output的线程数，当如果发现CPU使用率尚未达到上限，可以通过调整该参数，为Logstash提供更高的性能。建议将Worker数设置适当超过CPU核数可以减少IO等待时间对处理过程的影响。实际调优中可以先通过-w指定该参数，当确定好数值后再写入配置文件中。
  - pipeline.batch.size:
  该指标用于指定单个worker线程一次性执行flilter和output的event批量数。增大该值可以减少IO次数，提高处理速度，但是也以为这增加内存等资源的消耗。当与Elasticsearch联用时，该值可以用于指定Elasticsearch一次bluck操作的大小。
  - pipeline.batch.delay:
  该指标用于指定worker等待时间的超时时间，如果worker在该时间内没有等到pipeline.batch.size个事件，那么将直接开始执行filter和output而不再等待。
