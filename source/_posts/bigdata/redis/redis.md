---
layout:     post
title:      Redis 笔记
author:     "banban"
header-img: "/images/essay/hello-world-bg.jpg"
catalog: true
tags:
    - Big Data
    - Redis
---

## 最佳实践

### 查出什么拖慢了 Redis

```bash
127.0.0.1:6379> INFO commandstats
# Commandstats
cmdstat_get:calls=78,usec=608,usec_per_call=7.79
cmdstat_setex:calls=5,usec=71,usec_per_call=14.20
cmdstat_keys:calls=2,usec=42,usec_per_call=21.00
cmdstat_info:calls=10,usec=1931,usec_per_call=193.10
```