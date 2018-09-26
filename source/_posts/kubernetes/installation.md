---
layout:     post
title:      "Kubernetes 集群安装(使用kubeadm)"
date:       2018-09-25 12:00:00
author:     "banban"
header-img: "/images/kube/bg.png"
catalog: true
tags:
    - Kubernetes
---

## 环境准备
### 操作系统
    Debian9: Debian 4.9.65-3+deb9u1 (2017-12-23) x86_64 GNU/Linux

### 服务器信息
hostname | IP
---|---
master-node | 10.82.45.41
minion-node-1 | 10.82.45.42
minion-node-2 | 10.82.45.43

### 预装软件
1. 安装systemd

    ```systemctl```工具之所以重要，是因为```systemctl```服务管理工具是之后Kubernetes安装过程中，其要判断别的服务是否启动的方式，如```kubeadm```在初始化集群的时候会判断```kubelet```服务是否启动，其主要通过 ```systemctl``` 方式判断，如果```systemd```工具不能使用，会导致失败(除非是强行抑制这个错误，但是难保证后续不出错)
    
    如果确定systemctl工具没有安装,可以按照如下安装
    ```
    apt-get update
    apt-get -y install systemd
    ```
    如果已经安装好之后发现
    ```
    systemctl status xxx.service
    ```
    之后会出现如下错误
    ```
    Failed to get properties: No such interface ''
    ```
    则说明系统默认并没有采用systemd来管理服务，这个时候需要修改系统内核参数
    
    编辑```/etc/default/grub```文件，找到GRUB_CMDLINE_LINUX参数，这个参数的值是一个键值对形式的参数集合，在这个参数内添加如下内容
    ```
    GRUB_CMDLINE_LINUX=" ... init=/bin/systemd"
    ```
    保存之后，更新grub来更新内核参数
    ```
    update-grub
    ```
    重启系统
    ```
    reboot
    ```

2. 关闭swap

    Kubernetes 1.8开始要求关闭系统的Swap，如果不关闭，默认配置下kubelet将无法启动。可以通过kubelet的启动参数--fail-swap-on=false更改这个限制。 我们这里关闭系统的Swap:
    ```
    swapoff -a
    ```
    修改 /etc/fstab 文件，注释掉 SWAP 的自动挂载，使用free -m确认swap已经关闭
    
    ```
    注意：生产环境下,还是建议不要关闭swap,通过--fail-swap-on=false参数来达到目的
    ```
    
3. 安装[cri-tools](https://github.com/kubernetes-incubator/cri-tools)
    
    CLI and validation tools for Kubelet Container Runtime Interface
    
    kubelet工具想要正常运行，需要安装该工具
    
    打开[release](https://github.com/kubernetes-incubator/cri-tools/releases)找到符合要求的版本(跟需要安装的Kubernetes对应)

    这边安装的版本选择v1.11.0
    ```
    wget https://github.com/kubernetes-incubator/cri-tools/releases/download/v1.11.0/crictl-v1.11.0-linux-amd64.tar.gz \
    && tar zxvf crictl-v1.11.0-linux-amd64.tar.gz \
    && mv crictl /usr/bin
    ```
    
4. 安装docker-ce
    ```
    apt-get remove docker docker-engine docker.io
    apt-get update
    
    apt-get install \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg2 \
        software-properties-common
    
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
    
    apt-key fingerprint 0EBFCD88
    
    add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/debian \
            $(lsb_release -cs) \
        stable"
       
    apt-get update
    apt-get install docker-ce
    ```
5. 安装cni工具(K8s网络需要使用)
    ```
    CNI_VERSION=v0.6.0 \
    && mkdir -p /opt/cni/bin \
    && curl -L "https://github.com/containernetworking/plugins/releases/download/${CNI_VERSION}/cni-plugins-amd64-${CNI_VERSION}.tgz" | tar -C /opt/cni/bin -xz
    ```

6. 配置iptables信息

    ```
    echo '1' > /proc/sys/net/ipv4/ip_forward
    echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
    echo 1 > /proc/sys/net/bridge/bridge-nf-call-ip6tables
    sysctl -p
    ```
    
## Kubernetes v1.11.0安装
### 获取二进制文件
在[Kubernetes](https://github.com/kubernetes/kubernetes)的github页面找到[release](https://github.com/kubernetes/kubernetes/releases)页，选择版本v1.11.0，点击[CHANGELOG-1.11.md](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.11.md#v1110)，会看到有包含server/client/node三个角色的Kubernetes的二进制文件,这边只需要下载node的二进制文件，我已经上传到了国内七牛云存储中
```
wget http://pbqsx8kpd.bkt.clouddn.com/kubernetes-node-linux-11-amd64.tar.gz \
&& tar zxvf kubernetes-node-linux-11-amd64.tar.gz \
&& cd kubernetes/node/bin \
&& chmod +x kube* \
&& cp kubelet kubectl kubeadm /usr/bin \
&& cd $HOME
```

### 配置kubelet服务到systemd中
```
RELEASE=v1.11.0 \
&& curl -sSL "https://raw.githubusercontent.com/kubernetes/kubernetes/${RELEASE}/build/debs/kubelet.service" > /etc/systemd/system/kubelet.service \
&& mkdir -p /etc/systemd/system/kubelet.service.d \
&& curl -sSL "https://raw.githubusercontent.com/kubernetes/kubernetes/${RELEASE}/build/debs/10-kubeadm.conf" > /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
```
重启服务
```
systemctl stop kubelet
systemctl daemon reload
systemctl enable kubelet
systemctl start kubelet
systemctl status kubelet
```

### 提前拉取docker镜像
由于kubeadm工具默认会去国外谷歌的镜像源拉取k8s安装需要的镜像文件(k8s.gcr.io), 这个时候就需要提前将docker镜像拉取下来之后重新tag，本人已经将镜像放置在netease内部镜像源中,直接按照如下执行即可

```
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/kube-scheduler-amd64:v1.11.0 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/kube-controller-manager-amd64:v1.11.0 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/kube-apiserver-amd64:v1.11.0 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/kube-proxy-amd64:v1.11.0 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/coredns:1.1.3 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/etcd-amd64:3.2.18 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/pause-amd64:3.1 && \
docker pull registry.cn-shenzhen.aliyuncs.com/k8s_gcr_io/pause:3.1
```

```
其中有一些镜像是非必需的,本人是因为后续需要为kubeflow提供镜像支撑,因此提前拉取，其中tf_operator、jupyterhub-k8s为非必需镜像
```

接下来为各个镜像打tag
```
docker tag 0e4a34a3b0e6 k8s.gcr.io/kube-scheduler-amd64:v1.11.0 && \ 
docker tag 55b70b420785 k8s.gcr.io/kube-controller-manager-amd64:v1.11.0 && \ 
docker tag 1d3d7afd77d1 k8s.gcr.io/kube-proxy-amd64:v1.11.0 && \ 
docker tag 214c48e87f58 k8s.gcr.io/kube-apiserver-amd64:v1.11.0 && \ 
docker tag b3b94275d97c k8s.gcr.io/coredns:1.1.3 && \ 
docker tag b8df3b177be2 k8s.gcr.io/etcd-amd64:3.2.18 && \ 
docker tag da86e6ba6ca1 k8s.gcr.io/pause-amd64:3.1 && \ 
docker tag da86e6ba6ca1 k8s.gcr.io/pause:3.1
```

### 初始化Master节点
```
kubeadm init --kubernetes-version=v1.11.0 --apiserver-advertise-address 10.82.45.41 --pod-network-cidr=10.244.0.0/16 --node-name=master-node
```
```--apiserver-advertise-address``` 指明用 Master 的哪个 interface 与 Cluster 的其他节点通信。如果 Master 有多个 interface，建议明确指定，如果不指定，kubeadm 会自动选择有默认网关的 interface

```--pod-network-cidr``` 指定 Pod 网络的范围。Kubernetes 支持多种网络方案，而且不同网络方案对 ```--pod-network-cidr``` 有自己的要求，这里设置为 ```10.244.0.0/16``` 是因为我们将使用 flannel 网络方案，必须设置成这个 CIDR。当然还有其他网络方案，比如 ```Canal```

初始化过程中,经历的主要过程包括

![image](/images/kube/kubeadm-init.png)
```
① kubeadm 执行初始化前的检查

② 生成 token 和证书 (token查询可以使用 kubeadm token list)

③ 生成 KubeConfig 文件，kubelet 需要这个文件与 Master 通信

④ 安装 Master 组件，会从 goolge 的 Registry 下载组件的 Docker 镜像，这一步可能会花一些时间，主要取决于网络质量

⑤ 安装附加组件 kube-proxy 和 kube-dns

⑥ Kubernetes Master 初始化成功

⑦ 提示如何配置 kubectl，后面会实践

⑧ 提示如何安装 Pod 网络，后面会实践

⑨ 提示如何注册其他节点到 Cluster，后面会实践
```

### 配置 kubectl

kubectl 是管理 Kubernetes Cluster 的命令行工具，前面我们已经在所有的节点安装了 kubectl。Master 初始化完成后需要做一些配置工作，然后 kubectl 就能使用了

依照 kubeadm init 输出的第 ⑦ 步提示，推荐用 Linux 普通用户执行 kubectl（root 会有一些问题）

我们为 普通用户(banban) 用户配置 kubectl：
```
su - banban
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
为了使用更便捷，启用 kubectl 命令的自动补全功能
```
echo "source <(kubectl completion bash)" >> ~/.bashrc
```
这样 banban 用户就可以使用 kubectl 了

### 安装 Flannel 网络(Optional)
要让 Kubernetes Cluster 能够工作，必须安装 Pod 网络，否则 Pod 之间无法通信

Kubernetes 支持多种网络方案，这里我们先使用 flannel, flannel是一个 coreOS组织开源的项目, 这个组织做了很多在k8s上面的工作, 信息如下

[CoreOS](https://coreos.com/)

[CoreOS github](https://github.com/coreos)

执行如下命令部署 flannel
```
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```
由于这边直接使用的是master分支的yaml文件, 不能保证后续是否出现兼容性问题, 因此如果出现了问题可以使用下列tag下的yaml文件
```
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.10.0/Documentation/kube-flannel.yml
```
结果如下
```
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
serviceaccount/flannel created
configmap/kube-flannel-cfg created
daemonset.extensions/kube-flannel-ds-amd64 created
daemonset.extensions/kube-flannel-ds-arm64 created
daemonset.extensions/kube-flannel-ds-arm created
daemonset.extensions/kube-flannel-ds-ppc64le created
daemonset.extensions/kube-flannel-ds-s390x created
```

### 安装weave网络模型(Optional)(和Flannel网络二选一)
```
sysctl net.bridge.bridge-nf-call-iptables=1
```
Weave Net works on ```amd64```, ```arm```, ```arm64``` and ```ppc64le``` without any extra action required. Weave Net sets hairpin mode by default. This allows Pods to access themselves via their Service IP address if they don’t know their PodIP.
```
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

### 开启RBAC权限作为开发使用
**Permissive RBAC Permissions**

You can replicate a permissive policy using RBAC role bindings.

*==Warning: The following policy allows ALL service accounts to act as cluster administrators. Any application running in a container receives service account credentials automatically, and could perform any action against the API, including viewing secrets and modifying permissions. This is not a recommended policy.==*

```
kubectl create clusterrolebinding permissive-binding \
--clusterrole=cluster-admin \
--user=admin \
--user=kubelet \
--group=system:serviceaccounts
```

```
kubectl create clusterrolebinding add-on-cluster-admin \
--clusterrole=cluster-admin \
--serviceaccount=kube-system:default
```

### 添加 k8s-node1、k8s-node2
在 k8s-node1、k8s-node2上执行如下命令，将其注册到 Cluster 中
```
kubeadm join 10.82.45.41:6443 --token ylwv3f.n5iqf5mova5xm3nl --discovery-token-ca-cert-hash sha256:a3b77b9f9af801f9fa238a5e06db9a0dff37a159f1083ecf238042942b9a51b7
```
这里的 --token 来自前面 kubeadm init 输出的第 ⑨ 步提示，如果当时没有记录下来可以通过 kubeadm token list 查看

执行结果
```
[preflight] running pre-flight checks
        [WARNING RequiredIPVSKernelModulesAvailable]: the IPVS proxier will not be used, because the following required kernel modules are not loaded: [ip_vs ip_vs_rr ip_vs_wrr ip_vs_sh] or no builtin kernel ipvs support: map[ip_vs:{} ip_vs_rr:{} ip_vs_wrr:{} ip_vs_sh:{} nf_conntrack_ipv4:{}]
you can solve this problem with following methods:
 1. Run 'modprobe -- ' to load missing kernel modules;
2. Provide the missing builtin kernel ipvs support

        [WARNING Service-Docker]: docker service is not enabled, please run 'systemctl enable docker.service'
I0711 10:56:53.967088    6978 kernel_validator.go:81] Validating kernel version
I0711 10:56:53.967522    6978 kernel_validator.go:96] Validating kernel config
[discovery] Trying to connect to API Server "192.168.18.129:6443"
[discovery] Created cluster-info discovery client, requesting info from "https://192.168.18.129:6443"
[discovery] Requesting info from "https://192.168.18.129:6443" again to validate TLS against the pinned public key
[discovery] Cluster info signature and contents are valid and TLS certificate validates against pinned roots, will use API Server "192.168.18.129:6443"
[discovery] Successfully established connection with API Server "192.168.18.129:6443"
[kubelet] Downloading configuration for the kubelet from the "kubelet-config-1.11" ConfigMap in the kube-system namespace
[kubelet] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[preflight] Activating the kubelet service
[tlsbootstrap] Waiting for the kubelet to perform the TLS Bootstrap...
[patchnode] Uploading the CRI Socket information "/var/run/dockershim.sock" to the Node API object "banban-k8s-2" as an annotation

This node has joined the cluster:
* Certificate signing request was sent to master and a response
  was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the master to see this node join the cluster.
```

为了能够在工作节点上执行kubectl命令,需要执行如下
```
sudo cp /etc/kubernetes/kubelet.conf $HOME/
sudo chown $(id -u):$(id -g) $HOME/kubelet.conf
export KUBECONFIG=$HOME/kubelet.conf
```

### 启动一个简单demo
- 部署应用
    ```
    kubectl run kubernetes-bootcamp \
          --image=docker.io/jocatalin/kubernetes-bootcamp:v1 \
          --port=8080
    ```
    这里我们通过 kubectl run 部署了一个应用，命名为 kubernetes-bootcamp
    
    Docker 镜像通过 ```--image``` 指定
    
    ```--port``` 设置应用对外服务的端口
    
    输出结果如下
    ```
    deployment.apps/kubernetes-bootcamp created
    ```
    这里 deployment 是 Kubernetes 的术语，可以理解为应用
    
    **Kubernetes 还有一个重要术语** ```Pod```
    
    ```Pod``` 是容器的集合，通常会将紧密相关的一组容器放到一个 ```Pod``` 中，同一个 ```Pod``` 中的所有容器共享 IP 地址和 Port 空间，也就是说它们在一个 ```network namespace``` 中
    
    ```Pod``` 是 Kubernetes 调度的最小单位，同一 Pod 中的容器始终被一起调度
    
    运行 ```kubectl get pods``` 查看当前的 Pod

- 访问应用

    默认情况下，所有 Pod 只能在集群内部访问。对于上面这个例子，要访问应用只能直接访问容器的 8080 端口。为了能够从外部访问应用，我们需要将容器的 8080 端口映射到节点的端口。
    
    执行如下命令：
    ```
    kubectl expose deployment/kubernetes-bootcamp \
          --type="NodePort" \
          --port 8080
    ```
    输出
    ```
    service/kubernetes-bootcamp exposed
    ```
    执行命令 kubectl get services 可以查看应用被映射到节点的哪个端口
    ```
    kubectl get services 
    ```
    ```
    NAME                  TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
    kubernetes            ClusterIP   10.96.0.1        <none>        443/TCP          1h
    kubernetes-bootcamp   NodePort    10.106.120.173   <none>        8080:31295/TCP   11s
    ```
    查看这个服务对应的pod
    ```
    kubectl get pods
    ```
    ```
    NAME                                   READY     STATUS    RESTARTS   AGE
    kubernetes-bootcamp-86647cdf87-55msz   1/1       Running   0          1h
    ```
    查看具体这个pod在哪一个node
    ```
    kubectl describe pods kubernetes-bootcamp-86647cdf87-55msz
    ```
    ```
    Name:           kubernetes-bootcamp-86647cdf87-55msz
    Namespace:      default
    Node:           banban-k8s-2/192.168.18.130
    Start Time:     Wed, 11 Jul 2018 13:07:33 +0800
    Labels:         pod-template-hash=4220378943
                    run=kubernetes-bootcamp
    Annotations:    <none>
    Status:         Running
    IP:             10.244.1.6
    ```
    
    因此外部访问服务可以通过
    
    ```
    curl 192.168.18.130:31295
    ```
    ```
    Hello Kubernetes bootcamp! | Running on: kubernetes-bootcamp-86647cdf87-55msz | v=1
    ```
    
### 常用命令
- ***kubeadm***

    node节点加入到集群中 
    ```
    kubeadm join --token <token1> <master-ip>:6443
    ```
    master节点查找认证token信息
    ```
    kubeadm token list
    ```
    重置配置
    ```
    kubeadm reset
    ```
    
- ***kubectl***

    获取nodes节点信息
    ```
    kubectl get nodes
    ```
    获取所有pod的信息
    ```
    kubectl get pod --all-namespaces
    ```
    获取pod信息及其具体在哪一node上
    ```
    kubectl get pod --all-namespaces -o wide
    ```
    获取某一个pod的具体信息
    ```
    kubectl describe pod <Pod Name>
    ```
    删除
    ```
    kubectl delete -f <file-name>
    kubectl delete pod <pod-name>
    kubectl delete rc <rc-name>
    kubectl delete service <service-name>
    kubectl delete pod --all
    ```
    出于安全考虑，默认配置下 Kubernetes 不会将 Pod 调度到 Master 节点。如果希望将 k8s-master 也当作 Node 使用，可以执行如下命令：
    ```    
    kubectl taint node <k8s-master-name> node-role.kubernetes.io/master-
    ```
    如果要恢复 Master Only 状态，执行如下命令：
    ```
    kubectl taint node <k8s-master-name> node-role.kubernetes.io/master="":NoSchedule
    ```
    查看所有的pods发生的事件
    ```
    kubectl get events
    ```

- ***kubelet***

    kubelet 是唯一没有以容器形式运行的 Kubernetes 组件，它在 Ubuntu 中通过 Systemd 运行
    ```
    systemctl status kubelet.service
    ```
    查看kubelet是否正常启动,查看其健康状态
    ```
    curl -L http://127.0.0.1:10250/healthz
    ```
    
## 总结

Kubernetes安装过程中难免遇到很多问题，这边也许有些问题没有遇到，但是只要认真寻找解决方案就可以解决。目前Kubernete使用的网络是比较简单的flannel和wavenet，或许在之后的使用中会变更网络
