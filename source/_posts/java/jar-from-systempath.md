---
layout:     post
title:      添加外部JAR到maven项目中
date:       2019-02-28 21:00:00
author:     "banban"
header-img: "/images/java/java-bg.jpg"
catalog: true
tags:
    - Java
---

在写`Java`的时候难免想要用自己开发好的工具`jar`包，但是目前大部分项目都是用`maven`管理项目，这个时候想要引用自己开发的`jar`包，甚至有一些别人开发好的比较不广泛应用的`jar`包（这些依赖一般在公共 maven repository 中没有），绝大部分时候会想到使用`maven`的`systamPath`标签。比如一个`jna`包，我们一般会放在`maven`项目的一个`lib`目录(`pom`文件所在目录)中，然后在pom文件中配置
```
<dependency>
    <groupId>com.sun.jna</groupId>
    <artifactId>jna</artifactId>
    <version>3.2.5</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/jna-3.2.5.jar</systemPath>
</dependency>
```
这边必须配置`<scope></scope>`为`system`，否则会报错误。`${project.basedir}`是项目的根目录。

这种配置方法的弊端是打包项目之后有可能出现`ClassNotFound`的错误🙅。目前测试，这种配置方式在`spring-boot`的`maven`插件下打包不会有问题，但是如果是使用`maven-install-plugin`或者`maven-assembly-plugin`则会出现`ClassNotFound`的错误。

这边介绍三种添加定制化的`jar`包到`maven`项目中的方法。

## install:install-file
通过`install-file`可以实现手动添加`jar`包到本地仓库，这种方式比较简单，直接执行如下命令即可
```
mvn install:install-file -Dfile=<path-to-file>
```
⚠️注意⚠️：这边我们并没有指明`groupId`, `artifactId`, `version`等信息，因为`Maven-install-plugin`在版本`2.5`之后就能够自动从pom文件种读取这些信息了。

如果说要指明`groupId`, `artifactId`, `version`等信息，则执行：
```
mvn install:install-file -Dfile=<path-to-file> -DgroupId=<group-id> -DartifactId=<artifact-id> -Dversion=<version>
```
注：
- *<path-to-file\>* : 需要添加到本地仓库的JAR的路径
- *<group-id\>* : Group id
- *<artifact-id\>* : Artifact id
- *<version\>* :  版本号

例如：
```
mvn install:install-file –Dfile=lib/app.jar -DgroupId=com.banban.tutorials -DartifactId=example-app -Dversion=1.0.0
```
接下来就可以在另一个项目种引用这个jar包了
```
<dependency>
    <groupId>com.banban.tutorials</groupId>
    <artifactId>example-app</artifactId>
    <version>1.0.0</version>
</dependency>
```
但是这个做法是成本比较高的做法，因为你必须时刻考虑好：当你修改了代码之后，你需要重新打包jar包，然后重新执行`install:install-file`命令将对应`jar`包添加到本地仓库，一旦忘记就会导致引用`jar`包的项目不能使用新功能。而且如果是多人协作情况下，别人也必须不断得更新`jar`包到他们的本地仓库。

为了避免每次打包之后都要执行`mvn install:install-file`命令，可以在`pom.xml`文件种配置`maven-install-plugin`，使得在项目进行`initialize`的时候能够安装`jar`包到本地仓库，假设我们将`jar`包放置到`target`目录下，那么`pom.xml`种配置如下
```
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-install-plugin</artifactId>
    <version>2.5</version>
    <executions>
        <execution>
            <phase>initialize</phase>
            <goals>
                <goal>install-file</goal>
            </goals>
            <configuration>
                <groupId>com.banban.tutorials</groupId>
                <artifactId>example-app</artifactId>
                <version>1.0.0</version>
                <packaging>jar</packaging>
                <file>${project.basedir}/target/app.jar</file>
            </configuration>
        </execution>
    </executions>
</plugin>
```
在eclipse种有可能对应的`<phase>`标签会报错误，可以引入如下插件
```
<plugin>
    <groupId>org.eclipse.m2e</groupId>
    <artifactId>lifecycle-mapping</artifactId>
    <version>1.0.0</version>
    <configuration>
        <lifecycleMappingMetadata>
            <pluginExecutions>
                <pluginExecution>
                    <pluginExecutionFilter>
                        <groupId>org.codehaus.mojo</groupId>
                        <artifactId>aspectj-maven-plugin</artifactId>
                        <versionRange>[1.0,)</versionRange>
                        <goals>
                            <goal>test-compile</goal>
                            <goal>compile</goal>
                        </goals>
                    </pluginExecutionFilter>
                    <action>
                        <execute />
                    </action>
                </pluginExecution>
                <pluginExecution>
                    <pluginExecutionFilter>
                        <groupId>
                            org.apache.maven.plugins
                        </groupId>
                        <artifactId>
                            maven-install-plugin
                        </artifactId>
                        <versionRange>
                            [2.5,)
                        </versionRange>
                        <goals>
                            <goal>install-file</goal>
                        </goals>
                    </pluginExecutionFilter>
                    <action>
                        <execute>
                            <runOnIncremental>false</runOnIncremental>
                        </execute>
                    </action>
                </pluginExecution>
            </pluginExecutions>
        </lifecycleMappingMetadata>
    </configuration>
</plugin>
```

## system scope
另一种最直接的方法就是通过`systemPath`. 假设 `JAR` 包放在 `<PROJECT_ROOT_FOLDER>/lib`
```
<dependency>
	<groupId>com.banban.tutorials</groupId>
	<artifactId>example-app</artifactId>
	<version>1.0.0</version>
	<scope>system</scope>
	<systemPath>${project.basedir}/lib/yourJar.jar</systemPath>
</dependency>
```
但是这个方法会出现编译之后找不到类的错误。

## deploy:deploy
第三种方法就是通过本地另起一个仓库（默认情况仓库是在`～/.m2/repository`下），假设是
```
mkdir ~/repo
```
在编写好代码之后，首先打包项目为`jar`包到`target`目录，执行
```
mvn clean install
```
接下来执行`deploy:deploy`部署`jar`包到本地仓库`～/repo`种
```
mvn deploy:deploy-file -Dfile=target/fabric-labour-java-1.2.2.jar -DgroupId=com.scut.fabric -DartifactId=fabric-labour-java -Dversion=1.2.2 -Dpackaging=jar -Durl=file:/Users/banban/repo/ -DrepositoryId=maven-repository -DupdateReleaseInfo=true
```

⚠️注意⚠️：这边`-Durl`需要全路径

这样便可以将`jar`包引入到另一个需要使用`jar`包的项目了,首先将本地自定义仓库添加到配置中
```
<repositories>
    <repository>
       <id>maven-repository</id>
       <url>file:///Users/banban/repo/</url>
    </repository>
  </repositories>
```
然后添加依赖
```
<dependency>
	<groupId>com.scut.fabric</groupId>
	<artifactId>fabric-labour-java</artifactId>
	<version>1.2.2</version>
</dependency>
```

## 使用 Nexus repository manager
最好的方式就是将jar包交给仓库管理，可以搭建自己的maven服务仓库或者使用现有的一些仓库服务。具体可以参考：
https://help.sonatype.com/repomanager2

## 参考
[Maven : installing 3rd party JARs](https://maven.apache.org/guides/mini/guide-3rd-party-jars-local.html)

[Maven lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)

[Maven deploy:deploy-file goal](http://maven.apache.org/plugins/maven-deploy-plugin/deploy-file-mojo.html)

[Maven install:install-file goal](http://maven.apache.org/plugins/maven-install-plugin/install-file-mojo.html)

[Nexus](https://blog.sonatype.com/)

[3 ways to add local jar to maven project](http://roufid.com/3-ways-to-add-local-jar-to-maven-project/)
