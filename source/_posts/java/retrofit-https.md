---
layout:     post
title:      使用Retrofit访问HTTPS接口
date:       2019-04-28 10:00:00
author:     "banban"
header-img: "/images/java/java-bg.jpg"
catalog: true
tags:
    - Java
---

# 使用Retrofit访问HTTPS接口
Retrofit是一个类型安全的HTTP客户端工具，使用Java语言开发，主要为Android和Java客户端的HTTP请求的提供方便，Retrofit可以认为是OkHttp的加强版，是一个网络加载框架，底层使用的是OkHttp封装。从根本上来说，网络请求的工作本质上都是OkHttp完成的，而Retrofit则负责网络请求接口的封装，它提供了很多注解，简化了代码，有很多著名的开源库如：Retrofit + RxJava。

但是在使用Retrofit的过程中，难免会遇到请求HTTPS的情况，为此需要配置类似`SSLSocket`等内容。

## 添加Retrofit依赖
使用maven引入Retrofit配置，本人使用的版本是`2.5.0`
```
<dependency>
    <groupId>com.squareup.retrofit2</groupId>
    <artifactId>retrofit</artifactId>
    <version>2.5.0</version>
</dependency>

<dependency>
    <groupId>com.squareup.retrofit2</groupId>
    <artifactId>converter-gson</artifactId>
    <version>2.5.0</version>
</dependency>

<dependency>
    <groupId>com.squareup.retrofit2</groupId>
    <artifactId>adapter-rxjava</artifactId>
    <version>2.5.0</version>
</dependency>
```
在一般情况下，请求HTTP资源的时候Retrofit的使用很简单，如下是官方给出的例子。

首先定义一个接口类，通过注解标识请求类型和请求的URL
```
public interface GitHubService {
  @GET("users/{user}/repos")
  Call<List<Repo>> listRepos(@Path("user") String user);
}
```
通过Retrofit来创建这个接口的请求实例
```
Retrofit retrofit = new Retrofit.Builder()
    .baseUrl("https://api.github.com/")
    .build();

GitHubService service = retrofit.create(GitHubService.class);
```
之后请求资源内容便可以通过如下方式获取
```
Call<List<Repo>> repos = service.listRepos("octocat");
```

## Retrofit注解

- 请求方法

| 注解代码 | 请求格式 |
| ------ | :------: |
| @GET | GET请求 |
| @POST | POST请求 |
| @DELETE | DELETE请求 |
| @HEAD | HEAD请求 |
| @OPTIONS | OPTIONS请求 |
| @PATCH | PATCH请求 |

- 请求参数

| 注解代码 | 说明 |
| ------ | :------: |
| @Headers | 添加请求头 |
| @Path | 替换路径 |
| @Query | 替代参数值，通常是结合get请求的 |
| @FormUrlEncoded | 用表单数据提交 |
| @Field | 替换参数值，是结合post请求的 |

## 配置使用HTTPS
定义OkHttpClient
```
OkHttpClient okHttpClient = new OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .sslSocketFactory(getSSLSocketFactory(), new CustomTrustManager())
        .hostnameVerifier(getHostnameVerifier())
        .build();

Retrofit retrofit = new Retrofit.Builder()
        .baseUrl("https://localhost:8843")
        .client(okHttpClient)
        .addConverterFactory(new NullOnEmptyConverterFactory())
        .addConverterFactory(GsonConverterFactory.create())
        .addCallAdapterFactory(RxJavaCallAdapterFactory.create())
        .build();
```
其中`getSSLSocketFactor`方法内容如下
```
private static SSLSocketFactory getSSLSocketFactory() {
    SSLContext sslContext = null;
    try {
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        InputStream certificate = new FileInputStream(new File("tomcat.keystore"));
        keyStore.load(certificate, "somnus".toCharArray());

        sslContext = SSLContext.getInstance("TLS");
        TrustManagerFactory trustManagerFactory = TrustManagerFactory
                .getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(keyStore);
        sslContext.init(null, trustManagerFactory.getTrustManagers(), new SecureRandom());
    } catch (Exception e) {
        e.printStackTrace();
    }
    return sslContext.getSocketFactory();
}
```
Keystore之所以获取的实例是`PKCS12`，是因为本例子中的证书是自己生成的证书，证书采用java工具`keytool`生成，生成之后加到`spring-boot`中使用，具体可以参考文章[Spring-Boot + HTTPS](https://banbanpeppa.github.io/2019/04/28/java/spring/spring-boot-https/)。证书读取的外部文件`tomcat.keystore`，密码是`somnus`。

类`CustomTrustManager`内容如下
```
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.X509TrustManager;

public class CustomTrustManager implements X509TrustManager {
	@Override
	public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
	}

	@Override
	public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
	}

	@Override
	public X509Certificate[] getAcceptedIssuers() {
		return new X509Certificate[0];
	}
}
```
方法`getHostnameVerifier`内容，这个方法中的`HostnameVerifier`直接对验证返回了一个`true`，这个验证主要处理那些需要通过验证的域名，视情况而设置
```
public static HostnameVerifier getHostnameVerifier() {
    HostnameVerifier hostnameVerifier = new HostnameVerifier() {
        public boolean verify(String hostname, SSLSession session) {
            return true;
        }
    };
    return hostnameVerifier;
}
```
在使用Retrofit时，我们一般使用的是`GsonConverterFactory`转换器。但是有时候后台会返回为空的response。 app端会返回  `response.body() on a null object reference`错误，解决办法如下，通过自定义一个`NullOnEmptyConverterFactory`来对返回为空的response进行拦截二次处理。
```
import okhttp3.ResponseBody;
import retrofit2.Converter;
import retrofit2.Retrofit;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

public class NullOnEmptyConverterFactory extends Converter.Factory {

    @Override
    public Converter<ResponseBody, ?> responseBodyConverter(Type type, Annotation[] annotations, Retrofit retrofit) {
        final Converter<ResponseBody, ?> delegate = retrofit.nextResponseBodyConverter(this, type, annotations);
        return new Converter<ResponseBody, Object>() {
            @Override
            public Object convert(ResponseBody body) throws IOException {
                if (body.contentLength() == 0) return null;
                return delegate.convert(body);
            }
        };
    }
}
```

## 定制X509TrustManager
证书的验证是必须的，为此可以定制`X509TrustManager`，对其中的`checkServerTrusted`方法定制化，例如下例子
```
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigInteger;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPublicKey;

import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

public class CustomTrustManager implements X509TrustManager {

	// 证书中的公钥
	public static final String PUB_KEY = "30820122300d06092a864886f70d01010105000382010f003082010a0282010"
			+ "1009d5d3bc479af1780ec41485b592952cafaeb028f2917606cab945d0b3d2172fea8273921a3866b8c16a537a"
			+ "6502782734c68425be33b16515933881acdda6c008d8cbc8c215f38fecc876543f780ceca81f41d0731c62d5de"
			+ "9bcd4dfcfb05d0bd343a87bb00f60e4cdf2392896003acc6a7de2e161583d2542b4a3c6f290a67c49a06cc2cca"
			+ "ea929165b66a2f18f9f21ff5567a177c33c466a85505060316387762dadd143a63778603c98e29b9cd38aedf9e"
			+ "ccc0f75dda34b78bcc6f4959bd879217d07ce7681d170c41a103ec2f36e2e015ec0a365a8cafc5b5a563671bd0"
			+ "79096b83daf3f4140651975631e79f9becf0238c99cd8edbd7e078e4d0c35d3cb0203010001";

	@Override
	public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		// TODO Auto-generated method stub
	}

	@Override
	public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		if (chain == null) {
			throw new IllegalArgumentException("checkServerTrusted:Certificate array isnull");
		}

		if (!(chain.length > 0)) {
			throw new IllegalArgumentException("checkServerTrusted: Certificate is empty");
		}

		if (!(null != authType && authType.equalsIgnoreCase("ECDHE_RSA"))) {
			throw new CertificateException("checkServerTrusted: AuthType is not ECDHE_RSA");
		}

		// Perform customary SSL/TLS checks
		try {
			TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
			KeyStore keyStore = KeyStore.getInstance("PKCS12");
			InputStream certificate = new FileInputStream(new File("tomcat.keystore"));
			keyStore.load(certificate, "somnus".toCharArray());
			tmf.init(keyStore);
			for (TrustManager trustManager : tmf.getTrustManagers()) {
				((X509TrustManager) trustManager).checkServerTrusted(chain, authType);
			}
		} catch (Exception e) {
			throw new CertificateException(e);
		}
		// Hack ahead: BigInteger and toString(). We know a DER encoded Public Key begins
		// with 0×30 (ASN.1 SEQUENCE and CONSTRUCTED), so there is no leading 0×00 to drop.
		RSAPublicKey pubkey = (RSAPublicKey) chain[0].getPublicKey();
		String encoded = new BigInteger(1 /* positive */, pubkey.getEncoded()).toString(16);
		// Pin it!
		final boolean expected = PUB_KEY.equalsIgnoreCase(encoded);
		if (!expected) {
			throw new CertificateException(
					"checkServerTrusted: Expected public key: " + PUB_KEY + ", got public key:" + encoded);
		}
	}

	@Override
	public X509Certificate[] getAcceptedIssuers() {
		return new X509Certificate[0];
	}
}
```

# Reference
- http://square.github.io/retrofit/