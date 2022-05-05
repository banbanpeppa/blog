---
layout:     post
title:      Linux 服务性能分析与火焰图🔥
author:     "banban"
header-img: "/images/essay/hello-world-bg.jpg"
catalog:    true
tags:
    - Golang
    - Linux
---

运行在生产环境中的服务遇到资源消耗大，吃 CPU、内存的情况，便需要分析具体是哪一块代码执行出了问题。Linux 提供了许多性能分析工具，这边主要尝试使用 perf_events.

Perf_events简称perf是 Linux 系统原生提供的性能分析工具，会返回 CPU 正在执行的函数名以及调用栈（stack）。通常，它的执行频率是 99Hz（每秒99次），如果99次都返回同一个函数名，那就说明 CPU 这一秒钟都在执行同一个函数，可能存在性能问题。

### 工具安装

#### 安装 perf

perf 在 Linux 的工具包中，安装

```bash
apt install linux-tools
```

由于 perf 的分析往往会结合火焰图，需要补充安装 perf_data_converter ，这个能够将 perf 生成的文件进行转化，转为火焰图工具能够识别的格式，具体可参考：https://github.com/google/perf_data_converter，这边以 Debian 为例

#### 安装bazel

方法1：源安装 bazel
```bash
apt install apt-transport-https curl gnupg
curl -fsSL https://bazel.build/bazel-release.pub.gpg | gpg --dearmor > bazel.gpg
sudo mv bazel.gpg /etc/apt/trusted.gpg.d/
echo "deb [arch=amd64] https://storage.googleapis.com/bazel-apt stable jdk1.8" | sudo tee /etc/apt/sources.list.d/bazel.list

sudo apt update && sudo apt install bazel
bazel --version
```

方法2：二进制包安装 bazel

```bash
wget https://github.com/bazelbuild/bazel/releases/download/5.1.1/bazel-5.1.1-linux-x86_64
chmod +x bazel-<version>-installer-linux-x86_64.sh
./bazel-<version>-installer-linux-x86_64.sh --user
```

#### 安装perf_data_converter

```bash
git clone https://github.com/google/perf_data_converter.git
cd perf_data_converter
bazel build src:perf_to_profile
```
编译完之后将 perf_to_profile 文件移动到 `/usr/local/bin` 目录下

#### 下载 speedscope 工具并部署

项目地址： https://github.com/jlfwong/speedscope

服务部署可以通过 nginx 代理的方式，采用 docker-compose 完成

docker-compose.yaml

```yaml
version: '3.1'
services:
  custom-nginx-proxy:
    image: nginx:1.10.1
    volumes:
      - ${STATIC_FILE_PATH}:/usr/share/nginx/html:ro
      - ${NGINX_CONFIG_PATH}:/etc/nginx/conf.d/default.conf:ro
    ports:
      - ${PROXY_PORT:-8080}:80

networks:
  default:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1400
```

.env

```
STATIC_FILE_PATH=/home/nginx/file_store
NGINX_CONFIG_PATH=/home/nginx/default.conf
PROXY_PORT=80
```

default.conf
```
server {
    listen       80;
    server_name  localhost;

    #charset koi8-r;
    #access_log  /var/log/nginx/log/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        autoindex on;
        autoindex_exact_size on;
        autoindex_localtime on;
        charset utf-8;
    }

    #error_page  404              /404.html;
}
```

将 speedscope 的资源文件下载到目录 `/home/nginx/file_store` 目录下

```
cd /home/nginx/file_store
wget https://github.com/jlfwong/speedscope/releases/download/v1.13.0/speedscope-1.13.0.zip
unzip speedscope-1.13.0.zip
```

接来下就可以通过部署服务的机器访问：http://localhost/speedscope

#### 下载 FlameGraph

项目地址：https://github.com/brendangregg/FlameGraph

直接下载即可：https://github.com/brendangregg/FlameGraph/releases


### 定位问题

工具已就绪，直接按照需要执行下面的命令

例如要排查一个服务进程的资源使用情况，假定进程名称为：go-proxy

则先获取进程的 ID
```
TARGET_PID=$(ps -ef | grep go-proxy | grep -v grep | awk -F ' ' '{print $2}')
```
使用 perf 获取对应的性能指标记录
```
perf record -F 99 -p ${TARGET_PID} -g -- sleep 60
```
上面的命令中，perf record 表示记录，-F 99表示每秒 99 次，-p xxx 是进程号，即对哪个进程进行分析，也可以对线程进行分析，-g表示记录调用栈，sleep 60 则是持续 60 秒。运行后会产生一个庞大的文本文件 `perf.data`

为了能够利用火焰图进行观察，需要进行下列两个步骤获得符合火焰图格式的 profile 文件
```bash
perf script -i perf.data &> perf.unfold
```

```bash
FlameGraph-1.0/stackcollapse-perf.pl perf.unfold &> perf.folded
```

利用上面下载的 FlameGraph 工具导出火焰图

```
FlameGraph-1.0/flamegraph.pl perf.folded > perf.svg
```

例如：

![img](http://www.brendangregg.com/FlameGraphs/cpu-bash-flamegraph.svg)

同时也可以将 `perf.folded` 文件放到 speedscope 中分析

1. 将 `perf.folded` 文件放置于 `/home/nginx/file_store` 目录下
2. 通过链接 http://localhost/speedscope/#profileURL=http%3A%2F%2Flocalhost%2Fperf.folded&title=go_proxy 访问即可

上面的格式只要遵循：`#profileURL=[URL-encoded profile URL]&title=[URL-encoded custom title]`即可，不过要注意 profileUrl 需要是可跨域的，这边示例是放在同一个域名下，不会有跨域问题

![img](https://user-images.githubusercontent.com/150329/40900669-86eced80-6781-11e8-92c1-dc667b651e72.gif)

### 分析

火焰图最直观的就是每隔一个方法调用在整个 CPU 采样中的占比，移动鼠标到对应的方法栈上面能够显示 CPU 使用的占比，进而分析哪一个方法的资源耗费最大。

