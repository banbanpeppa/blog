---
layout:     post
title:      Hyperledger Fabric (六) — 使用fabric-sdk-java
author:     "banban"
header-img: "/images/blockchain/hyperledger/bg.jpg"
catalog: true
tags:
    - Blockchain
    - Hyperledger
    - Fabric
---

`fabric-sdk-java`是为了让java应用能够更加方便管理Fabric生态的应用开发工具。用户可以通过`fabric-sdk-java`的SDK来管理链码、channel等，也可以通过它来执行链码的数据集读写功能。同时还能够监控在channel上面的事件。

## 下载sdk代码

进入到工作目录
```
cd $GOPATH/src/github.com/hyperledger/
```

下载代码
```
git clone https://github.com/hyperledger/fabric-sdk-java.git && cd fabric-sdk-java
```

查看代码版本
```
git branch

*master
```

目前其实是最新版本的代码，经过测试，选用版本`v1.2.2`的可以通过测试。
```
git fetch origin && git checkout v1.2.2
```

## 启动网络
首先使用`screen`工具进入到新的一个终端中，进入到`sdkintegration`目录中
```
cd src/test/fixture/sdkintegration
```
启动网络
```
./fabric.sh up
```

紧接着按`Ctrl` + `a` 键退出`screen`会话

查看网络环境是否已经启动
```
docker ps -a

CONTAINER ID        IMAGE                              COMMAND                  CREATED              STATUS                          PORTS                                            NAMES
1dbf2e77cefb        hyperledger/fabric-peer:1.2.1      "peer node start"        About a minute ago   Up About a minute               0.0.0.0:8056->8056/tcp, 0.0.0.0:8058->8058/tcp   peer1.org2.example.com
01e599874f60        hyperledger/fabric-peer:1.2.1      "peer node start"        About a minute ago   Up About a minute               0.0.0.0:7056->7056/tcp, 0.0.0.0:7058->7058/tcp   peer1.org1.example.com
030901df2fdd        hyperledger/fabric-peer:1.2.1      "peer node start"        About a minute ago   Up About a minute               0.0.0.0:8051->8051/tcp, 0.0.0.0:8053->8053/tcp   peer0.org2.example.com
eb02b6d8a1c5        hyperledger/fabric-peer:1.2.1      "peer node start"        About a minute ago   Up About a minute               0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
1c22f5af0f83        hyperledger/fabric-ccenv:1.2.1     "/bin/bash"              About a minute ago   Exited (0) About a minute ago                                                    sdkintegration_ccenv_1
6720b9a4dac0        hyperledger/fabric-ca:1.2.1        "sh -c 'fabric-ca-..."   About a minute ago   Up About a minute               0.0.0.0:7054->7054/tcp                           ca_peerOrg1
17dab645cad5        hyperledger/fabric-orderer:1.2.1   "orderer"                About a minute ago   Up About a minute               0.0.0.0:7050->7050/tcp                           orderer.example.com
28405e3ac107        hyperledger/fabric-ca:1.2.1        "sh -c 'fabric-ca-..."   About a minute ago   Up About a minute               0.0.0.0:8054->7054/tcp                           ca_peerOrg2
424773cc950c        hyperledger/fabric-tools:1.2.1     "/usr/local/bin/co..."   About a minute ago   Up About a minute               0.0.0.0:7059->7059/tcp                           configtxlator
c0eb9c193cf2        docker/compose:1.19.0              "docker-compose up..."   About a minute ago   Up About a minute                                                                affectionate_beaver
```

过滤查询
```
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"


CONTAINER ID        NAMES                                        PORTS
564c1d67ee05        dev-peer1.org2.example.com-example_cc_go-1   
4026f5ed2ed2        dev-peer0.org2.example.com-example_cc_go-1   
bcfd208eff75        dev-peer1.org1.example.com-example_cc_go-1   
83a7d1d464b5        dev-peer0.org1.example.com-example_cc_go-1   
9bd77e0bcce7        peer1.org1.example.com                       0.0.0.0:7056->7056/tcp, 0.0.0.0:7058->7058/tcp
a47a91c66686        peer1.org2.example.com                       0.0.0.0:8056->8056/tcp, 0.0.0.0:8058->8058/tcp
4b41f1c868a8        peer0.org2.example.com                       0.0.0.0:8051->8051/tcp, 0.0.0.0:8053->8053/tcp
55851ba45ebe        peer0.org1.example.com                       0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp
cde29d63decd        ca_peerOrg2                                  0.0.0.0:8054->7054/tcp
466da500ac91        ca_peerOrg1                                  0.0.0.0:7054->7054/tcp
b5ffc617b821        configtxlator                                0.0.0.0:7059->7059/tcp
bf21abfb11b9        orderer.example.com                          0.0.0.0:7050->7050/tcp
```

如果启动网络成功，以上除了`sdkintegration_ccenv_1`容器会异常退出意外，其余容器都应该正常工作，接下来进入到根目录进行依赖管理
```
cd $GOPATH/src/github.com/hyperledger/fabric-sdk-java && mvn clean && mvn compile
```

## 运行测试代码
```
cd $GOPATH/src/github.com/hyperledger/fabric-sdk-java && mvn test -Dtest=org.hyperledger.fabric.sdkintegration.End2endIT
```

运行成功结果
```
...
That's all folks!
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 28.786 sec - in org.hyperledger.fabric.sdkintegration.End2endIT

Results :

Tests run: 1, Failures: 0, Errors: 0, Skipped: 0

[INFO] 
[INFO] --- jacoco-maven-plugin:0.7.9:report (post-unit-test) @ fabric-sdk-java ---
[INFO] Loading execution data file /opt/gopath/src/github.com/hyperledger/fabric-sdk-java/target/coverage-reports/jacoco-ut.exec
[INFO] Analyzed bundle 'fabric-java-sdk' with 199 classes
[WARNING] Classes in bundle 'fabric-java-sdk' do no match with execution data. For report generation the same class files must be used as at runtime.
[WARNING] Execution data for class org/hyperledger/fabric_ca/sdk/HFCAClient$AllHostsSSLSocketFactory does not match.
[WARNING] Execution data for class org/hyperledger/fabric_ca/sdk/HFCAClient$AllHostsSSLSocketFactory$1 does not match.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  59.439 s
[INFO] Finished at: 2018-11-12T18:22:42+08:00
[INFO] ------------------------------------------------------------------------
```
具体内容可以参考文件 [sdkintegration.txt](/files/hyperledger/sdkintegration.txt)

## 使用Fabric-Java-SDK
直接贴代码，代码结构如下

![image](/images/blockchain/hyperledger/sdk-project.jpg)

### bean
#### Chaincode
`Chaincode.java`
```
public class Chaincode {

    /** 当前将要访问的智能合约所属频道名称 */
    private String channelName;
    /** 智能合约名称 */
    private String chaincodeName;
    /** 智能合约安装路径 */
    private String chaincodePath;
    /** 智能合约版本号 */
    private String chaincodeVersion;
    /** 执行智能合约操作等待时间 */
    private int invokeWatiTime = 100000;
    /** 执行智能合约实例等待时间 */
    private int deployWatiTime = 120000;

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public String getChaincodeName() {
        return chaincodeName;
    }

    public void setChaincodeName(String chaincodeName) {
        this.chaincodeName = chaincodeName;
    }

    public String getChaincodePath() {
        return chaincodePath;
    }

    public void setChaincodePath(String chaincodePath) {
        this.chaincodePath = chaincodePath;
    }

    public String getChaincodeVersion() {
        return chaincodeVersion;
    }

    public void setChaincodeVersion(String chaincodeVersion) {
        this.chaincodeVersion = chaincodeVersion;
    }

    public int getInvokeWatiTime() {
        return invokeWatiTime;
    }

    public void setInvokeWatiTime(int invokeWatiTime) {
        this.invokeWatiTime = invokeWatiTime;
    }

    public int getDeployWatiTime() {
        return deployWatiTime;
    }

    public void setDeployWatiTime(int deployWatiTime) {
        this.deployWatiTime = deployWatiTime;
    }

}
```
#### Orderers
`Orderers.java`
```
import java.util.ArrayList;
import java.util.List;

public class Orderers {

    /** orderer 排序服务器所在根域名 */
    private String ordererDomainName;
    /** orderer 排序服务器集合 */
    private List<Orderer> orderers;

    public Orderers() {
        orderers = new ArrayList<>();
    }

    public String getOrdererDomainName() {
        return ordererDomainName;
    }

    public void setOrdererDomainName(String ordererDomainName) {
        this.ordererDomainName = ordererDomainName;
    }

    /** 新增排序服务器 */
    public void addOrderer(String name, String location) {
        orderers.add(new Orderer(name, location));
    }

    /** 获取排序服务器集合 */
    public List<Orderer> get() {
        return orderers;
    }

    /**
     * 排序服务器对象
     */
    public class Orderer {

        /** orderer 排序服务器的域名 */
        private String ordererName;
        /** orderer 排序服务器的访问地址 */
        private String ordererLocation;

        public Orderer(String ordererName, String ordererLocation) {
            super();
            this.ordererName = ordererName;
            this.ordererLocation = ordererLocation;
        }

        public String getOrdererName() {
            return ordererName;
        }

        public void setOrdererName(String ordererName) {
            this.ordererName = ordererName;
        }

        public String getOrdererLocation() {
            return ordererLocation;
        }

        public void setOrdererLocation(String ordererLocation) {
            this.ordererLocation = ordererLocation;
        }

    }

}
```
#### Peers
`Peers.java`
```
import java.util.ArrayList;
import java.util.List;

public class Peers {

    /** 当前指定的组织名称 */
    private String orgName; // Org1
    /** 当前指定的组织名称 */
    private String orgMSPID; // Org1MSP
    /** 当前指定的组织所在根域名 */
    private String orgDomainName; //org1.example.com
    /** orderer 排序服务器集合 */
    private List<Peer> peers;

    public Peers() {
        peers = new ArrayList<>();
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getOrgMSPID() {
        return orgMSPID;
    }

    public void setOrgMSPID(String orgMSPID) {
        this.orgMSPID = orgMSPID;
    }

    public String getOrgDomainName() {
        return orgDomainName;
    }

    public void setOrgDomainName(String orgDomainName) {
        this.orgDomainName = orgDomainName;
    }

    /** 新增排序服务器 */
    public void addPeer(String peerName, String peerEventHubName, String peerLocation, String peerEventHubLocation, String caLocation) {
        peers.add(new Peer(peerName, peerEventHubName, peerLocation, peerEventHubLocation, caLocation));
    }

    /** 获取排序服务器集合 */
    public List<Peer> get() {
        return peers;
    }

    /**
     * 节点服务器对象
     */
    public class Peer {

        /** 当前指定的组织节点域名 */
        private String peerName; // peer0.org1.example.com
        /** 当前指定的组织节点事件域名 */
        private String peerEventHubName; // peer0.org1.example.com
        /** 当前指定的组织节点访问地址 */
        private String peerLocation; // grpc://110.131.116.21:7051
        /** 当前指定的组织节点事件监听访问地址 */
        private String peerEventHubLocation; // grpc://110.131.116.21:7053
        /** 当前指定的组织节点ca访问地址 */
        private String caLocation; // http://110.131.116.21:7054
        /** 当前peer是否增加Event事件处理 */
        private boolean addEventHub = false;

        public Peer(String peerName, String peerEventHubName, String peerLocation, String peerEventHubLocation, String caLocation) {
            this.peerName = peerName;
            this.peerEventHubName = peerEventHubName;
            this.peerLocation = peerLocation;
            this.peerEventHubLocation = peerEventHubLocation;
            this.caLocation = caLocation;
        }

        public String getPeerName() {
            return peerName;
        }

        public void setPeerName(String peerName) {
            this.peerName = peerName;
        }

        public String getPeerEventHubName() {
            return peerEventHubName;
        }

        public void setPeerEventHubName(String peerEventHubName) {
            this.peerEventHubName = peerEventHubName;
        }

        public String getPeerLocation() {
            return peerLocation;
        }

        public void setPeerLocation(String peerLocation) {
            this.peerLocation = peerLocation;
        }

        public String getPeerEventHubLocation() {
            return peerEventHubLocation;
        }

        public void setPeerEventHubLocation(String eventHubLocation) {
            this.peerEventHubLocation = eventHubLocation;
        }

        public String getCaLocation() {
            return caLocation;
        }

        public void setCaLocation(String caLocation) {
            this.caLocation = caLocation;
        }

        public boolean isAddEventHub() {
            return addEventHub;
        }

        public void addEventHub(boolean addEventHub) {
            this.addEventHub = addEventHub;
        }

    }

}
```

### ChaincodeManager
`ChaincodeManager.java`
```
import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;
import it.fabric.labour.bean.Chaincode;
import it.fabric.labour.bean.Orderers;
import it.fabric.labour.bean.Peers;
import org.apache.log4j.Logger;
import org.hyperledger.fabric.sdk.*;
import org.hyperledger.fabric.sdk.exception.CryptoException;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;
import org.hyperledger.fabric.sdk.exception.TransactionException;
import org.hyperledger.fabric.sdk.security.CryptoSuite;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import static java.nio.charset.StandardCharsets.UTF_8;


public class ChaincodeManager {

    private static Logger log = Logger.getLogger(ChaincodeManager.class);

    private FabricConfig config;
    private Orderers orderers;
    private Peers peers;
    private Chaincode chaincode;

    private HFClient client;
    private FabricOrg fabricOrg;
    private Channel channel;
    private ChaincodeID chaincodeID;

    public ChaincodeManager(FabricConfig fabricConfig)
            throws CryptoException, InvalidArgumentException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, IOException, TransactionException, IllegalAccessException, InstantiationException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
        this.config = fabricConfig;

        orderers = this.config.getOrderers();
        peers = this.config.getPeers();
        chaincode = this.config.getChaincode();

        client = HFClient.createNewInstance();
        log.debug("Create instance of HFClient");
        client.setCryptoSuite(CryptoSuite.Factory.getCryptoSuite());
        log.debug("Set Crypto Suite of HFClient");

        fabricOrg = getFabricOrg();
        channel = getChannel();
        chaincodeID = getChaincodeID();

        client.setUserContext(fabricOrg.getPeerAdmin());
    }

    private FabricOrg getFabricOrg() throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, IOException {

        // java.io.tmpdir : C:\Users\<user>\AppData\Local\Temp\
        File storeFile = new File(System.getProperty("java.io.tmpdir") + "/HFCSampletest.properties");
        FabricStore fabricStore = new FabricStore(storeFile);

        // Get Org1 from configuration
        FabricOrg fabricOrg = new FabricOrg(peers, orderers, fabricStore, config.getCryptoConfigPath());
        log.debug("Get FabricOrg");
        return fabricOrg;
    }

    private Channel getChannel()
            throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, IOException, CryptoException, InvalidArgumentException, TransactionException {
        client.setUserContext(fabricOrg.getPeerAdmin());
        return getChannel(fabricOrg, client);
    }

    private Channel getChannel(FabricOrg fabricOrg, HFClient client)
            throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, IOException, CryptoException, InvalidArgumentException, TransactionException {
        Channel channel = client.newChannel(chaincode.getChannelName());
        //Channel channel = client.getChannel(chaincode.getChaincodeName());
        log.debug("Get Chain " + chaincode.getChannelName());

        //v1.1.0版本之后取消了该方法  channel.setTransactionWaitTime(chaincode.getInvokeWatiTime());
        //v1.1.0版本之后取消了该方法  channel.setDeployWaitTime(chaincode.getDeployWatiTime());

        for (int i = 0; i < peers.get().size(); i++) {
            File peerCert = Paths.get(config.getCryptoConfigPath(), "/peerOrganizations", peers.getOrgDomainName(), "peers", peers.get().get(i).getPeerName(), "tls/server.crt")
                    .toFile();
            if (!peerCert.exists()) {
                throw new RuntimeException(
                        String.format("Missing cert file for: %s. Could not find at location: %s", peers.get().get(i).getPeerName(), peerCert.getAbsolutePath()));
            }
            Properties peerProperties = new Properties();
            peerProperties.setProperty("pemFile", peerCert.getAbsolutePath());
            // ret.setProperty("trustServerCertificate", "true"); //testing
            // environment only NOT FOR PRODUCTION!
            peerProperties.setProperty("hostnameOverride", peers.getOrgDomainName());
            peerProperties.setProperty("sslProvider", "openSSL");
            peerProperties.setProperty("negotiationType", "TLS");
            // 在grpc的NettyChannelBuilder上设置特定选项
            peerProperties.put("grpc.ManagedChannelBuilderOption.maxInboundMessageSize", 9000000);
            channel.addPeer(client.newPeer(peers.get().get(i).getPeerName(), fabricOrg.getPeerLocation(peers.get().get(i).getPeerName()), peerProperties));
            if (peers.get().get(i).isAddEventHub()) {
                channel.addEventHub(
                        client.newEventHub(peers.get().get(i).getPeerEventHubName(), fabricOrg.getEventHubLocation(peers.get().get(i).getPeerEventHubName()), peerProperties));
            }
        }

        for (int i = 0; i < orderers.get().size(); i++) {
            File ordererCert = Paths.get(config.getCryptoConfigPath(), "/ordererOrganizations", orderers.getOrdererDomainName(), "orderers", orderers.get().get(i).getOrdererName(),
                    "tls/server.crt").toFile();
            if (!ordererCert.exists()) {
                throw new RuntimeException(
                        String.format("Missing cert file for: %s. Could not find at location: %s", orderers.get().get(i).getOrdererName(), ordererCert.getAbsolutePath()));
            }
            Properties ordererProperties = new Properties();
            ordererProperties.setProperty("pemFile", ordererCert.getAbsolutePath());
            ordererProperties.setProperty("hostnameOverride", orderers.getOrdererDomainName());
            ordererProperties.setProperty("sslProvider", "openSSL");
            ordererProperties.setProperty("negotiationType", "TLS");
            ordererProperties.put("grpc.ManagedChannelBuilderOption.maxInboundMessageSize", 9000000);
            ordererProperties.setProperty("ordererWaitTimeMilliSecs", "300000");
            channel.addOrderer(
                    client.newOrderer(orderers.get().get(i).getOrdererName(), fabricOrg.getOrdererLocation(orderers.get().get(i).getOrdererName()), ordererProperties));
        }

        log.debug("channel.isInitialized() = " + channel.isInitialized());
        if (!channel.isInitialized()) {
            channel.initialize();
        }
        if (config.isRegisterEvent()) {
            channel.registerBlockListener(new BlockListener() {

                @Override
                public void received(BlockEvent event) {
                    // TODO
                    log.debug("========================Event事件监听开始========================");
                    try {
                        log.debug("event.getChannelId() = " + event.getChannelId());
                        //v1.0.1 log.debug("event.getEvent().getChaincodeEvent().getPayload().toStringUtf8() = " + event.getEvent().getChaincodeEvent().getPayload().toStringUtf8());
                        log.debug("event.getBlock().getData().getDataList().size() = " + event.getBlock().getData().getDataList().size());
                        ByteString byteString = event.getBlock().getData().getData(0);
                        String result = byteString.toStringUtf8();
                        log.debug("byteString.toStringUtf8() = " + result);

                        String r1[] = result.split("END CERTIFICATE");
                        String rr = r1[2];
                        log.debug("rr = " + rr);
                    } catch (InvalidProtocolBufferException e) {
                        // TODO
                        e.printStackTrace();
                    }
                    log.debug("========================Event事件监听结束========================");
                }
            });
        }
        return channel;
    }

    private ChaincodeID getChaincodeID() {
        return ChaincodeID.newBuilder().setName(chaincode.getChaincodeName()).setVersion(chaincode.getChaincodeVersion()).setPath(chaincode.getChaincodePath()).build();
    }

    /**
     * 执行智能合约
     * 
     * @param fcn
     *            方法名
     * @param args
     *            参数数组
     * @return
     * @throws InvalidArgumentException
     * @throws ProposalException
     * @throws InterruptedException
     * @throws ExecutionException
     * @throws TimeoutException
     * @throws IOException 
     * @throws TransactionException 
     * @throws CryptoException 
     * @throws InvalidKeySpecException 
     * @throws NoSuchProviderException 
     * @throws NoSuchAlgorithmException 
     */
    public Map<String, String> invoke(String fcn, String[] args)
            throws InvalidArgumentException, ProposalException, InterruptedException, ExecutionException, TimeoutException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, CryptoException, TransactionException, IOException {
        Map<String, String> resultMap = new HashMap<>();

        Collection<ProposalResponse> successful = new LinkedList<>();
        Collection<ProposalResponse> failed = new LinkedList<>();

        /// Send transaction proposal to all peers
        TransactionProposalRequest transactionProposalRequest = client.newTransactionProposalRequest();
        transactionProposalRequest.setChaincodeID(chaincodeID);
        transactionProposalRequest.setFcn(fcn);
        transactionProposalRequest.setArgs(args);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperLedgerFabric", "TransactionProposalRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "TransactionProposalRequest".getBytes(UTF_8));
        tm2.put("result", ":)".getBytes(UTF_8));
        transactionProposalRequest.setTransientMap(tm2);

        Collection<ProposalResponse> transactionPropResp = channel.sendTransactionProposal(transactionProposalRequest, channel.getPeers());
        for (ProposalResponse response : transactionPropResp) {
            if (response.getStatus() == ProposalResponse.Status.SUCCESS) {
                successful.add(response);
            } else {
                failed.add(response);
            }
        }

        Collection<Set<ProposalResponse>> proposalConsistencySets = SDKUtils.getProposalConsistencySets(transactionPropResp);
        if (proposalConsistencySets.size() != 1) {
            log.error("Expected only one set of consistent proposal responses but got " + proposalConsistencySets.size());
        }

        if (failed.size() > 0) {
            ProposalResponse firstTransactionProposalResponse = failed.iterator().next();
            log.error("Not enough endorsers for inspect:" + failed.size() + " endorser error: " + firstTransactionProposalResponse.getMessage() + ". Was verified: "
                    + firstTransactionProposalResponse.isVerified());
            resultMap.put("code", "error");
            resultMap.put("data", firstTransactionProposalResponse.getMessage());
            return resultMap;
        } else {
            log.info("Successfully received transaction proposal responses.");
            ProposalResponse resp = transactionPropResp.iterator().next();
            byte[] x = resp.getChaincodeActionResponsePayload();
            String resultAsString = null;
            if (x != null) {
                resultAsString = new String(x, "UTF-8");
            }
            log.info("resultAsString = " + resultAsString);
            channel.sendTransaction(successful);
            resultMap.put("code", "success");
            resultMap.put("data", resultAsString);
            return resultMap;
        }

//        channel.sendTransaction(successful).thenApply(transactionEvent -> {
//            if (transactionEvent.isValid()) {
//                log.info("Successfully send transaction proposal to orderer. Transaction ID: " + transactionEvent.getTransactionID());
//            } else {
//                log.info("Failed to send transaction proposal to orderer");
//            }
//            // chain.shutdown(true);
//            return transactionEvent.getTransactionID();
//        }).get(chaincode.getInvokeWatiTime(), TimeUnit.SECONDS);
    }

    /**
     * 查询智能合约
     * 
     * @param fcn
     *            方法名
     * @param args
     *            参数数组
     * @return
     * @throws InvalidArgumentException
     * @throws ProposalException
     * @throws IOException 
     * @throws TransactionException 
     * @throws CryptoException 
     * @throws InvalidKeySpecException 
     * @throws NoSuchProviderException 
     * @throws NoSuchAlgorithmException 
     */
    public Map<String, String> query(String fcn, String[] args) throws InvalidArgumentException, ProposalException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, CryptoException, TransactionException, IOException {
        Map<String, String> resultMap = new HashMap<>();
        String payload = "";
        QueryByChaincodeRequest queryByChaincodeRequest = client.newQueryProposalRequest();
        queryByChaincodeRequest.setArgs(args);
        queryByChaincodeRequest.setFcn(fcn);
        queryByChaincodeRequest.setChaincodeID(chaincodeID);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperLedgerFabric", "QueryByChaincodeRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "QueryByChaincodeRequest".getBytes(UTF_8));
        queryByChaincodeRequest.setTransientMap(tm2);

        Collection<ProposalResponse> queryProposals = channel.queryByChaincode(queryByChaincodeRequest, channel.getPeers());
        for (ProposalResponse proposalResponse : queryProposals) {
            if (!proposalResponse.isVerified() || proposalResponse.getStatus() != ProposalResponse.Status.SUCCESS) {
                log.debug("Failed query proposal from peer " + proposalResponse.getPeer().getName() + " status: " + proposalResponse.getStatus() + ". Messages: "
                        + proposalResponse.getMessage() + ". Was verified : " + proposalResponse.isVerified());
                resultMap.put("code", "error");
                resultMap.put("data", "Failed query proposal from peer " + proposalResponse.getPeer().getName() + " status: " + proposalResponse.getStatus() + ". Messages: "
                        + proposalResponse.getMessage() + ". Was verified : " + proposalResponse.isVerified());
            } else {
                payload = proposalResponse.getProposalResponse().getResponse().getPayload().toStringUtf8();
                log.debug("Query payload from peer: " + proposalResponse.getPeer().getName());
                log.debug("" + payload);
                resultMap.put("code", "success");
                resultMap.put("data", payload);
            }
        }
        return resultMap;
    }

}
```
### FabricConfig
`FabricConfig.java`
```
import java.io.File;

import it.fabric.labour.bean.Chaincode;
import it.fabric.labour.bean.Orderers;
import it.fabric.labour.bean.Peers;
import org.apache.log4j.Logger;


public class FabricConfig {

    private static Logger log = Logger.getLogger(FabricConfig.class);

    /** 节点服务器对象 */
    private Peers peers;
    /** 排序服务器对象 */
    private Orderers orderers;
    /** 智能合约对象 */
    private Chaincode chaincode;
    /** channel-artifacts所在路径：默认channel-artifacts所在路径/xxx/WEB-INF/classes/fabric/channel-artifacts/ */
    private String channelArtifactsPath;
    /** crypto-config所在路径：默认crypto-config所在路径/xxx/WEB-INF/classes/fabric/crypto-config/ */
    private String cryptoConfigPath;
    private boolean registerEvent = false;

    public FabricConfig() {
        // 默认channel-artifacts所在路径 /xxx/WEB-INF/classes/fabric/channel-artifacts/
        channelArtifactsPath = getChannlePath() + "/channel-artifacts/";
        // 默认crypto-config所在路径 /xxx/WEB-INF/classes/fabric/crypto-config/
        cryptoConfigPath = getChannlePath() + "/crypto-config/";
    }

    /**
     * 默认fabric配置路径
     * 
     * @return channel path
     */
    private String getChannlePath() {
        String directorys = ChaincodeManager.class.getClassLoader().getResource("fabric").getFile();
        log.debug("directorys = " + directorys);
        File directory = new File(directorys);
        log.debug("directory = " + directory.getPath());

        return directory.getPath();
        // return "src/main/resources/fabric/channel-artifacts/";
    }

    public Peers getPeers() {
        return peers;
    }

    public void setPeers(Peers peers) {
        this.peers = peers;
    }

    public Orderers getOrderers() {
        return orderers;
    }

    public void setOrderers(Orderers orderers) {
        this.orderers = orderers;
    }

    public Chaincode getChaincode() {
        return chaincode;
    }

    public void setChaincode(Chaincode chaincode) {
        this.chaincode = chaincode;
    }

    public String getChannelArtifactsPath() {
        return channelArtifactsPath;
    }

    public void setChannelArtifactsPath(String channelArtifactsPath) {
        this.channelArtifactsPath = channelArtifactsPath;
    }

    public String getCryptoConfigPath() {
        return cryptoConfigPath;
    }

    public void setCryptoConfigPath(String cryptoConfigPath) {
        this.cryptoConfigPath = cryptoConfigPath;
    }

    public boolean isRegisterEvent() {
        return registerEvent;
    }

    public void setRegisterEvent(boolean registerEvent) {
        this.registerEvent = registerEvent;
    }

}
```
### FabricManager
`FabricManager.java`
```
import it.fabric.labour.bean.Chaincode;
import it.fabric.labour.bean.Orderers;
import it.fabric.labour.bean.Peers;

import org.hyperledger.fabric.sdk.exception.CryptoException;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.TransactionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;

public class FabricManager {

	private static Logger log = LoggerFactory.getLogger(FabricManager.class);
	
    private ChaincodeManager manager;

    private static FabricManager instance = null;

    public static FabricManager obtain()
            throws CryptoException, InvalidArgumentException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, TransactionException, IOException, IllegalAccessException, InstantiationException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
        if (null == instance) {
            synchronized (FabricManager.class) {
                if (null == instance) {
                    instance = new FabricManager();
                }
            }
        }
        return instance;
    }

    private FabricManager()
            throws CryptoException, InvalidArgumentException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, TransactionException, IOException, IllegalAccessException, InstantiationException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
        manager = new ChaincodeManager(getConfig());
    }

    /**
     * 获取节点服务器管理器
     * 
     * @return 节点服务器管理器
     */
    public ChaincodeManager getManager() {
        return manager;
    }

    /**
     * 根据节点作用类型获取节点服务器配置
     * 
     * @param type
     *            服务器作用类型（1、执行；2、查询）
     * @return 节点服务器配置
     */
    private FabricConfig getConfig() {
        FabricConfig config = new FabricConfig();
        config.setOrderers(getOrderers());
        config.setPeers(getPeers());
        config.setChaincode(getChaincode("foo", "example_cc_go", "github.com/example_cc", "1"));
        config.setChannelArtifactsPath(getChannleArtifactsPath());
        config.setCryptoConfigPath(getCryptoConfigPath());
        return config;
    }

    private Orderers getOrderers() {
        Orderers orderer = new Orderers();
        orderer.setOrdererDomainName("example.com");
        orderer.addOrderer("orderer.example.com", "grpc://222.201.145.194:7050");
        //orderer.addOrderer("orderer0.example.com", "grpc://192.168.10.31x:7050");
        //orderer.addOrderer("orderer2.example.com", "grpc://192.168.10.31xx:7050");
        return orderer;
    }

    /**
     * 获取节点服务器集
     * 
     * @return 节点服务器集
     */
    private Peers getPeers() {
        Peers peers = new Peers();
        peers.setOrgName("peerOrg1");
        peers.setOrgMSPID("Org1MSP");
        peers.setOrgDomainName("org1.example.com");
        // peer1 无法进行链码操作  peers.addPeer("peer1.org1.example.com", "peer1.org1.example.com", "grpc://222.201.145.194:8051", "grpc://222.201.145.194:8053", "http://222.201.145.194:7054");
        peers.addPeer("peer0.org1.example.com", "peer0.org1.example.com", "grpc://222.201.145.194:7051", "grpc://222.201.145.194:7053", "http://222.201.145.194:7054");
        return peers;
    }

    /**
     * 获取智能合约
     * 
     * @param channelName
     *            频道名称
     * @param chaincodeName
     *            智能合约名称
     * @param chaincodePath
     *            智能合约路径
     * @param chaincodeVersion
     *            智能合约版本
     * @return chaincode
     *              智能合约
     */
    private Chaincode getChaincode(String channelName, String chaincodeName, String chaincodePath, String chaincodeVersion) {
        Chaincode chaincode = new Chaincode();
        chaincode.setChannelName(channelName);
        chaincode.setChaincodeName(chaincodeName);
        chaincode.setChaincodePath(chaincodePath);
        chaincode.setChaincodeVersion(chaincodeVersion);
        chaincode.setInvokeWatiTime(100000);
        chaincode.setDeployWatiTime(120000);
        return chaincode;
    }

    /**
     * 获取channel-artifacts配置路径
     * 
     * @return .../fabric/channel-artifacts/
     */
    private String getChannleArtifactsPath() {
        String directorys = FabricManager.class.getClassLoader().getResource("fabric").getFile();
        log.debug("directorys = " + directorys);
        File directory = new File(directorys);
        log.debug("directory = " + directory.getPath());

        return directory.getPath() + "/channel-artifacts/";
    }

    /**
     * 获取crypto-config配置路径
     * 
     * @return .../fabric/crypto-config/
     */
    private String getCryptoConfigPath() {
        String directorys = FabricManager.class.getClassLoader().getResource("fabric").getFile();
        log.debug("directorys = " + directorys);
        File directory = new File(directorys);
        log.debug("directory = " + directory.getPath());

        return directory.getPath() + "/crypto-config/";
    }

}
```
### FabricOrg
`FabricOrg.java`
```
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import it.fabric.labour.bean.Orderers;
import it.fabric.labour.bean.Peers;
import org.apache.log4j.Logger;
import org.hyperledger.fabric.sdk.Peer;
import org.hyperledger.fabric.sdk.User;
import org.hyperledger.fabric_ca.sdk.HFCAClient;


public class FabricOrg {

    private static Logger log = Logger.getLogger(FabricOrg.class);

    /** 名称 */
    private String name;
    /** 会员id */
    private String mspid;
    /** ca 客户端 */
    private HFCAClient caClient;

    /** 用户集合 */
    Map<String, User> userMap = new HashMap<>();
    /** 本地节点集合 */
    Map<String, String> peerLocations = new HashMap<>();
    /** 本地排序服务集合 */
    Map<String, String> ordererLocations = new HashMap<>();
    /** 本地事件集合 */
    Map<String, String> eventHubLocations = new HashMap<>();
    /** 节点集合 */
    Set<Peer> peers = new HashSet<>();
    /** 联盟管理员用户 */
    private FabricUser admin;
    /** 本地 ca */
    private String caLocation;
    /** ca 配置 */
    private Properties caProperties = null;

    /** 联盟单节点管理员用户 */
    private FabricUser peerAdmin;

    /** 域名名称 */
    private String domainName;

    public FabricOrg(Peers peers, Orderers orderers, FabricStore fabricStore, String cryptoConfigPath)
            throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, IOException {
        this.name = peers.getOrgName();
        this.mspid = peers.getOrgMSPID();
        for (int i = 0; i < peers.get().size(); i++) {
            addPeerLocation(peers.get().get(i).getPeerName(), peers.get().get(i).getPeerLocation());
            addEventHubLocation(peers.get().get(i).getPeerEventHubName(), peers.get().get(i).getPeerEventHubLocation());
            setCALocation(peers.get().get(i).getCaLocation());
        }
        for (int i = 0; i < orderers.get().size(); i++) {
            addOrdererLocation(orderers.get().get(i).getOrdererName(), orderers.get().get(i).getOrdererLocation());
        }
        setDomainName(peers.getOrgDomainName()); // domainName=tk.anti-moth.com

        // Set up HFCA for Org1
        // setCAClient(HFCAClient.createNewInstance(peers.getCaLocation(), getCAProperties()));

        setAdmin(fabricStore.getMember("admin", peers.getOrgName())); // 设置该组织的管理员

        File skFile = Paths.get(cryptoConfigPath, "/peerOrganizations/", peers.getOrgDomainName(), String.format("/users/Admin@%s/msp/keystore", peers.getOrgDomainName())).toFile();
        File certificateFile = Paths.get(cryptoConfigPath, "/peerOrganizations/", peers.getOrgDomainName(),
                String.format("/users/Admin@%s/msp/signcerts/Admin@%s-cert.pem", peers.getOrgDomainName(), peers.getOrgDomainName())).toFile();
        log.debug("skFile = " + skFile.getAbsolutePath());
        log.debug("certificateFile = " + certificateFile.getAbsolutePath());
        setPeerAdmin(fabricStore.getMember(peers.getOrgName() + "Admin", peers.getOrgName(), peers.getOrgMSPID(), findFileSk(skFile), certificateFile)); // 一个特殊的用户，可以创建通道，连接对等点，并安装链码
    }

    public String getName() {
        return name;
    }

    /**
     * 获取联盟管理员用户
     * 
     * @return 联盟管理员用户
     */
    public FabricUser getAdmin() {
        return admin;
    }

    /**
     * 设置联盟管理员用户
     * 
     * @param admin
     *            联盟管理员用户
     */
    public void setAdmin(FabricUser admin) {
        this.admin = admin;
    }

    /**
     * 获取会员id
     * 
     * @return 会员id
     */
    public String getMSPID() {
        return mspid;
    }

    /**
     * 设置本地ca
     * 
     * @param caLocation
     *            本地ca
     */
    public void setCALocation(String caLocation) {
        this.caLocation = caLocation;
    }

    /**
     * 获取本地ca
     * 
     * @return 本地ca
     */
    public String getCALocation() {
        return this.caLocation;
    }

    /**
     * 添加本地节点
     * 
     * @param name
     *            节点key
     * @param location
     *            节点
     */
    public void addPeerLocation(String name, String location) {
        peerLocations.put(name, location);
    }

    /**
     * 添加本地组织
     * 
     * @param name
     *            组织key
     * @param location
     *            组织
     */
    public void addOrdererLocation(String name, String location) {
        ordererLocations.put(name, location);
    }

    /**
     * 添加本地事件
     * 
     * @param name
     *            事件key
     * @param location
     *            事件
     */
    public void addEventHubLocation(String name, String location) {
        eventHubLocations.put(name, location);
    }

    /**
     * 获取本地节点
     * 
     * @param name
     *            节点key
     * @return 节点
     */
    public String getPeerLocation(String name) {
        return peerLocations.get(name);
    }

    /**
     * 获取本地组织
     * 
     * @param name
     *            组织key
     * @return 组织
     */
    public String getOrdererLocation(String name) {
        return ordererLocations.get(name);
    }

    /**
     * 获取本地事件
     * 
     * @param name
     *            事件key
     * @return 事件
     */
    public String getEventHubLocation(String name) {
        return eventHubLocations.get(name);
    }

    /**
     * 获取一个不可修改的本地节点key集合
     * 
     * @return 节点key集合
     */
    public Set<String> getPeerNames() {
        return Collections.unmodifiableSet(peerLocations.keySet());
    }

    /**
     * 获取一个不可修改的本地节点集合
     * 
     * @return 节点集合
     */
    public Set<Peer> getPeers() {
        return Collections.unmodifiableSet(peers);
    }

    /**
     * 获取一个不可修改的本地组织key集合
     * 
     * @return 组织key集合
     */
    public Set<String> getOrdererNames() {
        return Collections.unmodifiableSet(ordererLocations.keySet());
    }

    /**
     * 获取一个不可修改的本地组织集合
     * 
     * @return 组织集合
     */
    public Collection<String> getOrdererLocations() {
        return Collections.unmodifiableCollection(ordererLocations.values());
    }

    /**
     * 获取一个不可修改的本地事件key集合
     * 
     * @return 事件key集合
     */
    public Set<String> getEventHubNames() {
        return Collections.unmodifiableSet(eventHubLocations.keySet());
    }

    /**
     * 获取一个不可修改的本地事件集合
     * 
     * @return 事件集合
     */
    public Collection<String> getEventHubLocations() {
        return Collections.unmodifiableCollection(eventHubLocations.values());
    }

    /**
     * 设置 ca 客户端
     * 
     * @param caClient
     *            ca 客户端
     */
    public void setCAClient(HFCAClient caClient) {
        this.caClient = caClient;
    }

    /**
     * 获取 ca 客户端
     * 
     * @return ca 客户端
     */
    public HFCAClient getCAClient() {
        return caClient;
    }

    /**
     * 向用户集合中添加用户
     * 
     * @param user
     *            用户
     */
    public void addUser(FabricUser user) {
        userMap.put(user.getName(), user);
    }

    /**
     * 从用户集合根据名称获取用户
     * 
     * @param name
     *            名称
     * @return 用户
     */
    public User getUser(String name) {
        return userMap.get(name);
    }

    /**
     * 向节点集合中添加节点
     * 
     * @param peer
     *            节点
     */
    public void addPeer(Peer peer) {
        peers.add(peer);
    }

    /**
     * 设置 ca 配置
     * 
     * @param caProperties
     *            ca 配置
     */
    public void setCAProperties(Properties caProperties) {
        this.caProperties = caProperties;
    }

    /**
     * 获取 ca 配置
     * 
     * @return ca 配置
     */
    public Properties getCAProperties() {
        return caProperties;
    }

    /**
     * 设置联盟单节点管理员用户
     * 
     * @param peerAdmin
     *            联盟单节点管理员用户
     */
    public void setPeerAdmin(FabricUser peerAdmin) {
        this.peerAdmin = peerAdmin;
    }

    /**
     * 获取联盟单节点管理员用户
     * 
     * @return 联盟单节点管理员用户
     */
    public FabricUser getPeerAdmin() {
        return peerAdmin;
    }

    /**
     * 设置域名名称
     * 
     * @param doainName
     *            域名名称
     */
    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    /**
     * 获取域名名称
     * 
     * @return 域名名称
     */
    public String getDomainName() {
        return domainName;
    }

    /**
     * 从指定路径中获取后缀为 _sk 的文件，且该路径下有且仅有该文件
     * 
     * @param directorys
     *            指定路径
     * @return File
     */
    private File findFileSk(File directory) {
        File[] matches = directory.listFiles((dir, name) -> name.endsWith("_sk"));
        if (null == matches) {
            throw new RuntimeException(String.format("Matches returned null does %s directory exist?", directory.getAbsoluteFile().getName()));
        }
        if (matches.length != 1) {
            throw new RuntimeException(String.format("Expected in %s only 1 sk file but found %d", directory.getAbsoluteFile().getName(), matches.length));
        }
        return matches[0];
    }

}
```
### FabircStore
`FabricStore.java`
```
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Serializable;
import java.io.StringReader;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.Security;
import java.security.spec.InvalidKeySpecException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.io.IOUtils;
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.hyperledger.fabric.sdk.Enrollment;

/**
 * 联盟存储配置对象
 */
public class FabricStore {

    private String file;
    /** 用户信息集合 */
    private final Map<String, FabricUser> members = new HashMap<>();

    public FabricStore(File file) {
        this.file = file.getAbsolutePath();
    }

    /**
     * 设置与名称相关的值
     *
     * @param name
     *            名称
     * @param value
     *            相关值
     */
    public void setValue(String name, String value) {
        Properties properties = loadProperties();
        try (OutputStream output = new FileOutputStream(file)) {
            properties.setProperty(name, value);
            properties.store(output, "");
            output.close();
        } catch (IOException e) {
            System.out.println(String.format("Could not save the keyvalue store, reason:%s", e.getMessage()));
        }
    }

    /**
     * 获取与名称相关的值
     *
     * @param 名称
     * @return 相关值
     */
    public String getValue(String name) {
        Properties properties = loadProperties();
        return properties.getProperty(name);
    }

    /**
     * 加载配置文件
     * 
     * @return 配置文件对象
     */
    private Properties loadProperties() {
        Properties properties = new Properties();
        try (InputStream input = new FileInputStream(file)) {
            properties.load(input);
            input.close();
        } catch (FileNotFoundException e) {
            System.out.println(String.format("Could not find the file \"%s\"", file));
        } catch (IOException e) {
            System.out.println(String.format("Could not load keyvalue store from file \"%s\", reason:%s", file, e.getMessage()));
        }
        return properties;
    }

    /**
     * 用给定的名称获取用户
     * 
     * @param 名称
     * @param 组织
     * 
     * @return 用户
     */
    public FabricUser getMember(String name, String org) {
        // 尝试从缓存中获取User状态
        FabricUser fabricUser = members.get(FabricUser.toKeyValStoreName(name, org));
        if (null != fabricUser) {
            return fabricUser;
        }
        // 创建User，并尝试从键值存储中恢复它的状态(如果找到的话)
        fabricUser = new FabricUser(name, org, this);
        return fabricUser;
    }

    /**
     * 用给定的名称获取用户
     * 
     * @param name
     *            名称
     * @param org
     *            组织
     * @param mspId
     *            会员id
     * @param privateKeyFile
     * @param certificateFile
     * 
     * @return user 用户
     * 
     * @throws IOException
     * @throws NoSuchAlgorithmException
     * @throws NoSuchProviderException
     * @throws InvalidKeySpecException
     */
    public FabricUser getMember(String name, String org, String mspId, File privateKeyFile, File certificateFile)
            throws IOException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException {
        try {
            // 尝试从缓存中获取User状态
            FabricUser fabricUser = members.get(FabricUser.toKeyValStoreName(name, org));
            if (null != fabricUser) {
                System.out.println("尝试从缓存中获取User状态  User = " + fabricUser);
                return fabricUser;
            }
            // 创建User，并尝试从键值存储中恢复它的状态(如果找到的话)
            fabricUser = new FabricUser(name, org, this);
            fabricUser.setMspId(mspId);
            String certificate = new String(IOUtils.toByteArray(new FileInputStream(certificateFile)), "UTF-8");
            PrivateKey privateKey = getPrivateKeyFromBytes(IOUtils.toByteArray(new FileInputStream(privateKeyFile)));
            fabricUser.setEnrollment(new StoreEnrollement(privateKey, certificate));
            return fabricUser;
        } catch (IOException e) {
            e.printStackTrace();
            throw e;
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            throw e;
        } catch (NoSuchProviderException e) {
            e.printStackTrace();
            throw e;
        } catch (InvalidKeySpecException e) {
            e.printStackTrace();
            throw e;
        } catch (ClassCastException e) {
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 通过字节数组信息获取私钥
     * 
     * @param data
     *            字节数组
     * 
     * @return 私钥
     * 
     * @throws IOException
     * @throws NoSuchProviderException
     * @throws NoSuchAlgorithmException
     * @throws InvalidKeySpecException
     */
    private PrivateKey getPrivateKeyFromBytes(byte[] data) throws IOException, NoSuchProviderException, NoSuchAlgorithmException, InvalidKeySpecException {
        final Reader pemReader = new StringReader(new String(data));
        final PrivateKeyInfo pemPair;
        try (PEMParser pemParser = new PEMParser(pemReader)) {
            pemPair = (PrivateKeyInfo) pemParser.readObject();
        }
        PrivateKey privateKey = new JcaPEMKeyConverter().setProvider(BouncyCastleProvider.PROVIDER_NAME).getPrivateKey(pemPair);
        return privateKey;
    }

    static {
        try {
            Security.addProvider(new BouncyCastleProvider());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 自定义注册登记操作类
     * 
     * @author yangyi47
     *
     */
    static final class StoreEnrollement implements Enrollment, Serializable {

        private static final long serialVersionUID = 6965341351799577442L;

        /** 私钥 */
        private final PrivateKey privateKey;
        /** 授权证书 */
        private final String certificate;

        StoreEnrollement(PrivateKey privateKey, String certificate) {
            this.certificate = certificate;
            this.privateKey = privateKey;
        }

        @Override
        public PrivateKey getKey() {
            return privateKey;
        }

        @Override
        public String getCert() {
            return certificate;
        }
    }

}
```
### FabricUser
`FabricUser.java`
```
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.Set;

import org.bouncycastle.util.encoders.Hex;
import org.hyperledger.fabric.sdk.Enrollment;
import org.hyperledger.fabric.sdk.User;

import io.netty.util.internal.StringUtil;

/**
 * 联盟用户对象
 */
public class FabricUser implements User, Serializable {

    private static final long serialVersionUID = 5695080465408336815L;

    /** 名称 */
    private String name;
    /** 规则 */
    private Set<String> roles;
    /** 账户 */
    private String account;
    /** 从属联盟 */
    private String affiliation;
    /** 组织 */
    private String organization;
    /** 注册操作的密�? */
    private String enrollmentSecret;
    /** 会员id */
    private String mspId;
    /** 注册登记操作 */
    Enrollment enrollment = null;

    /** 存储配置对象 */
    private transient FabricStore keyValStore;
    private String keyValStoreName;

    public FabricUser(String name, String org, FabricStore store) {
        this.name = name;
        this.keyValStore = store;
        this.organization = org;
        this.keyValStoreName = toKeyValStoreName(this.name, org);

        String memberStr = keyValStore.getValue(keyValStoreName);
        if (null != memberStr) {
            saveState();
        } else {
            restoreState();
        }
    }

    /**
     * 设置账户信息并将用户状态更新至存储配置对象
     * 
     * @param account
     *            账户
     */
    public void setAccount(String account) {
        this.account = account;
        saveState();
    }

    @Override
    public String getAccount() {
        return this.account;
    }

    /**
     * 设置从属联盟信息并将用户状态信息更新至存储配置对象
     * 
     * @param affiliation
     *            从属联盟
     */
    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
        saveState();
    }

    @Override
    public String getAffiliation() {
        return this.affiliation;
    }

    @Override
    public Enrollment getEnrollment() {
        return this.enrollment;
    }

    /**
     * 设置会员id信息并将用户状态信息更新至存储配置对象
     * 
     * @param mspID
     *            会员id
     */
    public void setMspId(String mspID) {
        this.mspId = mspID;
        saveState();
    }

    @Override
    public String getMspId() {
        return this.mspId;
    }

    @Override
    public String getName() {
        return this.name;
    }

    /**
     * 设置规则信息并将用户状态信息更新至存储配置对象
     * 
     * @param roles
     *            规则
     */
    public void setRoles(Set<String> roles) {
        this.roles = roles;
        saveState();
    }

    @Override
    public Set<String> getRoles() {
        return this.roles;
    }

    public String getEnrollmentSecret() {
        return enrollmentSecret;
    }

    /**
     * 设置注册操作的密钥信息并将用户状态更新至存储配置对象
     * 
     * @param enrollmentSecret
     *            注册操作的密钥
     */
    public void setEnrollmentSecret(String enrollmentSecret) {
        this.enrollmentSecret = enrollmentSecret;
        saveState();
    }

    /**
     * 设置注册登记操作信息并将用户状态信息更新至存储配置对象
     * 
     * @param enrollment
     *            注册登记操作
     */
    public void setEnrollment(Enrollment enrollment) {
        this.enrollment = enrollment;
        saveState();
    }

    /**
     * 确定这个名称是否已注册
     * 
     * @return 与否
     */
    public boolean isRegistered() {
        return !StringUtil.isNullOrEmpty(enrollmentSecret);
    }

    /**
     * 确定这个名字是否已经注册
     *
     * @return 与否
     */
    public boolean isEnrolled() {
        return this.enrollment != null;
    }

    /** 将用户状态保存至存储配置对象 */
    public void saveState() {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try {
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(this);
            oos.flush();
            keyValStore.setValue(keyValStoreName, Hex.toHexString(bos.toByteArray()));
            bos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 从键值存储中恢复该用户的状态(如果找到的话)。如果找不到，什么也不要做
     * 
     * @return 返回用户
     */
    private FabricUser restoreState() {
        String memberStr = keyValStore.getValue(keyValStoreName);
        if (null != memberStr) {
            // 用户在键值存储中被找到，因此恢复状�?��??
            byte[] serialized = Hex.decode(memberStr);
            ByteArrayInputStream bis = new ByteArrayInputStream(serialized);
            try {
                ObjectInputStream ois = new ObjectInputStream(bis);
                FabricUser state = (FabricUser) ois.readObject();
                if (state != null) {
                    this.name = state.name;
                    this.roles = state.roles;
                    this.account = state.account;
                    this.affiliation = state.affiliation;
                    this.organization = state.organization;
                    this.enrollmentSecret = state.enrollmentSecret;
                    this.enrollment = state.enrollment;
                    this.mspId = state.mspId;
                    return this;
                }
            } catch (Exception e) {
                throw new RuntimeException(String.format("Could not restore state of member %s", this.name), e);
            }
        }
        return null;
    }

    public static String toKeyValStoreName(String name, String org) {
        System.out.println("toKeyValStoreName = " + "user." + name + org);
        return "user." + name + org;
    }

}
```

### Example
`Example.java`, 这个类主要用于测试链码调用
```
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.hyperledger.fabric.sdk.exception.CryptoException;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;
import org.hyperledger.fabric.sdk.exception.TransactionException;

import static java.lang.String.format;

public class Example{

    public static void out(String format, Object... args) {

        System.err.flush();// 冲刷缓冲区
        System.out.flush();

        System.out.println(format(format, args));
        System.err.flush();
        System.out.flush();

    }

	public static void main(String[] args) throws CryptoException, InvalidArgumentException, NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException, TransactionException, IOException, ProposalException, InterruptedException, ExecutionException, TimeoutException, IllegalAccessException, InstantiationException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException {
		ChaincodeManager manager = FabricManager.obtain().getManager();
		out("\n\n\nRUNNING: %s.\n", "Fabric SDK Test");

		out("fabric chaincode invoke, move(b,a) 200.");

        String fcn = "move" ;
        String[] arguments = new String[]{"b","a","100"};
        Map<String, String> responses  = manager.invoke(fcn, arguments);
        if (responses != null) {
            out("successfully invoke chaincode method invoke, move (a, b) 200.");
            out("response: ");
            JSONObject successful = JSONObject.parseObject(JSON.toJSONString(responses));
            System.out.println(successful);

            out("fabric invoke test done! \n");
        }


        out("fabric chaincode query, query(b).");
        fcn = "query" ;
        arguments = new String[]{"b"};
        responses = manager.query(fcn, arguments);

        if (responses != null) {
            out("successfully get query result query(b).");
            out("response: ");
            JSONObject successful = JSONObject.parseObject(JSON.toJSONString(responses));
            System.out.println(successful);
        }
	}
}
```

## 运行测试代码
会得到结果
```
RUNNING: Fabric SDK Test.

fabric chaincode invoke, move(b,a) 200.
successfully invoke chaincode method invoke, move (a, b) 200.
response: 
{"code":"success","data":":)"}
fabric invoke test done! 

fabric chaincode query, query(b).
successfully get query result query(b).
response: 
{"code":"success","data":"100"}

Process finished with exit code 0
```

## 结
对于JAVA-SDK的使用于开发具体可以参考官方`sdkintegration`的`End2endIT`代码。

## 附 - 关于fabric-java-sdk导入Eclipse

由于官方的项目对`eclipse`的兼容性问题，需要处理之后才能成功导入

首先下载代码
```
git clone https://github.com/hyperledger/fabric-sdk-java.git
```
然后进入到项目中修改`.project`和`.classpath`文件，删除文件头部的注释
```
<!--
#
# Copyright DTCC Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#
-->
```

接下来通过`eclipse`导入项目，导入之后会出现弹框提示出错
```
No marketplace entries found to handle maven-antrun-plugin:1.4:run in Eclipse. Please see Help for more information.
```
这个点击`Finish`按钮跳过即可

接下来执行`maven`命令
```
mvn install -DskipTests
```

执行完成之后使用`eclipse`打开`pom.xml`文件，选择`Overview`，会出现一个红色错误
```
Plugin execution not covered by lifecycle configuration: org.apache.maven.plugins:maven-antrun-plugin:1.4:run (execution: default, phase: generate-test-resources). 
```
右键出现选项，选择`Mark goal run as ignored in eclipse...`即可

之后改项目的`Build Path`的JVM变量为JDK，如果还是会有错误，则尝试右键Proejct，选择`Maven` -> `Update Project`，之后再修改`Build Path`即可。

## Reference

fabric_java_sdk_v1 : https://github.com/lzbinlantian/fabric_java_sdk_v1