---
layout:     post
title:      Spring Boot 配置使用 Gson
date:       2018-12-15 10:00:00
author:     "banban"
header-img: "/images/java/spring-boot.jpg"
catalog: true
tags:
    - Java
    - Spring Boot
---
# Spring Boot 配置使用 gson 替代jackson
## 第一步，修改pom.xml配置文件
在添加SpringBoot web依赖的地方将jackson的包去掉：
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>jackson-databind</artifactId>
            <groupId>com.fasterxml.jackson.core</groupId>
        </exclusion>
    </exclusions>
</dependency>
```
## 第二步，添加一个自定义的HttpMessageConverter
```
@Configuration
@ConditionalOnClass(Gson.class)
@ConditionalOnMissingClass("com.fasterxml.jackson.core.JsonGenerator")
@ConditionalOnBean(Gson.class)
public class GsonHttpMessageConverterConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public GsonHttpMessageConverter gsonHttpMessageConverter(Gson gson) {
        GsonHttpMessageConverter converter = new GsonHttpMessageConverter();
        converter.setGson(gson);
        return converter;
    }
}
```
## 第三步，修改启动方法
```
@SpringBootApplication
@EnableAutoConfiguration(exclude = { JacksonAutoConfiguration.class })
public class Langrenshaplusbackground2Application {

    public static void main(String[] args) {
        SpringApplication.run(Langrenshaplusbackground2Application.class, args);
    }
}
```
## 第四步，修改application.properties
```
# Preferred JSON mapper to use for HTTP message conversion.
spring.http.converters.preferred-json-mapper=gson
```
其他配置项
```
# GSON (GsonProperties)

# Format to use when serializing Date objects.
spring.gson.date-format= 

# Whether to disable the escaping of HTML characters such as '<', '>', etc.
spring.gson.disable-html-escaping= 

# Whether to exclude inner classes during serialization.
spring.gson.disable-inner-class-serialization= 

# Whether to enable serialization of complex map keys (i.e. non-primitives).
spring.gson.enable-complex-map-key-serialization= 

# Whether to exclude all fields from consideration for serialization or deserialization that do not have the "Expose" annotation.
spring.gson.exclude-fields-without-expose-annotation= 

# Naming policy that should be applied to an object's field during serialization and deserialization.
spring.gson.field-naming-policy= 

# Whether to generate non executable JSON by prefixing the output with some special text.
spring.gson.generate-non-executable-json= 

# Whether to be lenient about parsing JSON that doesn't conform to RFC 4627.
spring.gson.lenient= 

# Serialization policy for Long and long types.
spring.gson.long-serialization-policy= 

# Whether to output serialized JSON that fits in a page for pretty printing.
spring.gson.pretty-printing= 

# Whether to serialize null fields.
spring.gson.serialize-nulls= 
```

## 备注
If you want to get rid of Jackson completely then you can exclude it from `spring-boot-starter-web` dependency in the `pom.xml` file like so -
```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
	<!-- Exclude the default Jackson dependency -->
	<exclusions>
		<exclusion>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-json</artifactId>
		</exclusion>
	</exclusions>
</dependency>
```