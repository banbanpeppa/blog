---
layout:     post
title:      Spring-boot + JPA 实现组合查询
date:       2019-01-25 10:00:00
author:     "banban"
header-img: "/images/java/spring-boot.jpg"
catalog: true
tags:
    - Java
    - Spring Boot
---

# Spring-boot + JPA 实现组合查询

## 环境准备
在spring-boot项目中，pom文件需要添加
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
## Specification
Specification算是JPA里面比较灵活的查询规范了，方便实现复杂的查询方式。

### 为什么需要Specification
Spring-Data JPA 本身支持了比较简单的查询方式，也就是根据属性名成结合一些规范编写查询方法，例如，一个Customer对象有name属性，那么如果想要实现根据name来查询，只需要在接口文件中添加一个方法`findByName(String name)`即可实现。
```
public interface CustomerRepository extends JpaRepository<Customer, Long> {
  Customer findByName(String name);
  Customer findByEmailAddress(String emailAddress);
  List<Customer> findByLastname(String lastname, Sort sort);
  Page<Customer> findByFirstname(String firstname, Pageable pageable);
}
```

但是在许多情况下，会有比较复杂的查询，那么这个时候通过自动生成查询方法的方式就不再可行。

为了实现复杂查询，JPA提供了Criteria接口，这个是一套标准接口，来看一个例子，在一个平台中，当一个老客户(注册以来两年)生日的时候，系统想要发送一个优惠券给该用户，那么传统使用 JPA 2.0 Criteria API 去实现:
```
LocalDate today = new LocalDate();

CriteriaBuilder builder = em.getCriteriaBuilder();
CriteriaQuery<Customer> query = builder.createQuery(Customer.class);
Root<Customer> root = query.from(Customer.class);

Predicate hasBirthday = builder.equal(root.get(Customer_.birthday), today);
Predicate isLongTermCustomer = builder.lessThan(root.get(Customer_.createdAt), today.minusYears(2); 
query.where(builder.and(hasBirthday, isLongTermCustomer));
em.createQuery(query.select(root)).getResultList();
```
- 首先获得时间，去比较用户的注册时间
- 接下来是获得JPA中查询使用的实例
- 设置查询条件，首先判断今天是否为某个客户的生日，然后判断是否为老客户
- 执行查询条件，获得满足条件的用户

这里面的主要问题就是代码扩展性比较差，因为需要设置CriteriaBuilder, CriteriaQuery, Root，同时这部分的代码可读性比较差。

因此推荐使用 Specification 。

### Specification
为了实现可重用的断言，JPA 里面引入了一个Specification接口，接口的封装很简单，如下
```
public interface Specification<T> {
  Predicate toPredicate(Root<T> root, CriteriaQuery query, CriteriaBuilder cb);
}
```
在Java8中，我们可以非常方便地实现如上使用Criteria实现的效果
```
public CustomerSpecifications {
    public static Specification<Customer> customerHasBirthday() {
        return (root, query, cb) -> { 
            return cb.equal(root.get(Customer_.birthday), today);
        };
    }
    
    public static Specification<Customer> isLongTermCustomer() {
        return (root, query, cb) -> { 
            return cb.lessThan(root.get(Customer_.createdAt), new LocalDate.minusYears(2));
        };
    }
}
```
这样对应JPA的repository实现就可以如下
```
customerRepository.findAll(hasBirthday());
customerRepository.findAll(isLongTermCustomer());
```
而其实Specification为我们做的事情就是替我们准备了CriteriaQuery, Root, CriteriaBuilder， 有了这些可重用的断言之后，便可以将他们组合起来实现更加复杂的查询了
```
customerRepository.findAll(where(customerHasBirthday()).and(isLongTermCustomer()));
```

## JPA多条件、多表查询
如果需要使用Specification，那么对应的Repository需要实现接口`JpaSpecificationExecutor`
```
public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {}
```
### 单表多条件查询
在结合 Spring Boot 和 JPA 之后，为了四号线多条件查询，并且整理分页， 则可以考虑使用 Predicate 断言， 例如现在针对 User ， 想要根据用户的不同属性进行模糊查询，同时如果属性值为空或者空字符串，则跳过该属性，不作为查询条件，同时属于单表多条件查询，则
```
//在spring-jpa 2之后 不再使用 new PageRuest(page, pageSize) 的方式
Pageable pageable = PageRequest.of(page, pageSize);
	
//实现条件查询，组合查询
Specification<User> specification = new Specification<User>() {
    private static final long serialVersionUID = 1L;

    @Override
    public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        String account = request.getAccount();
        String name = request.getName();
        String phone = request.getPhone();
        
        String accountType = request.getAccountType();
        String city = request.getCity();
        String type = request.getType();
        
        //用列表装载断言对象
        List<Predicate> predicates = new ArrayList<Predicate>();
        
        if(org.apache.commons.lang3.StringUtils.isNotBlank(name)) {
            //模糊查询，like
            Predicate predicate = cb.like(root.get("name").as(String.class), "%" + name +"%");
            predicates.add(predicate);
        } 
        if (StringUtils.isNotBlank(account)) {
            Predicate predicate = cb.like(root.get("account").as(String.class), "%" + account +"%");
            predicates.add(predicate);
        }
        if (StringUtils.isNotBlank(phone)) {
            //精确查询，equal
            Predicate predicate = cb.equal(root.get("phoneNumber").as(String.class), phone);
            predicates.add(predicate);
        }
        if (StringUtils.isNotBlank(accountType)) {
            Predicate predicate = cb.equal(root.get("accountType").as(String.class), accountType);
            predicates.add(predicate);
        }
        if (StringUtils.isNotBlank(city)) {
            Predicate predicate = cb.equal(root.get("city").as(String.class), city);
            predicates.add(predicate);
        }
        if (StringUtils.isNotBlank(type)) {
            Predicate predicate = cb.equal(root.get("type").as(String.class), type);
            predicates.add(predicate);
        }
        //判断是否有断言，如果没有则返回空，不进行条件组合
        if (predicates.size() == 0) {
            return null;
        }
        
        //转换为数组，组合查询条件
        Predicate[] p = new Predicate[predicates.size()];
        return cb.and(predicates.toArray(p));
    }
};

//交给DAO处理查询任务
Page<User> dataPages = userDAO.findAll(specification, pageable);
```

### 多表多条件查询
在许多时候会面对多表多条件查询，实现实例如下
```
//封装查询对象Specification
Specification<Courier> example = new Specification<Courier>() {

    @Override
    public Predicate toPredicate(Root<Courier> root, CriteriaQuery<?> query, CriteriaBuilder cb) {

        //获取客户端查询条件
        String company = model.getCompany();
        String courierNum = model.getCourierNum();
        Standard standard = model.getStandard();
        String type = model.getType();

        //定义集合来确定Predicate[] 的长度，因为CriteriaBuilder的or方法需要传入的是断言数组
        List<Predicate> predicates = new ArrayList<>();

        //对客户端查询条件进行判断,并封装Predicate断言对象
        if (StringUtils.isNotBlank(company)) {
            //root.get("company")获取字段名
            //company客户端请求的字段值
            //as(String.class)指定该字段的类型
            Predicate predicate = cb.equal(root.get("company").as(String.class), company);
            predicates.add(predicate);
        }
        if (StringUtils.isNotBlank(courierNum)) {
            Predicate predicate = cb.equal(root.get("courierNum").as(String.class), courierNum);
            predicates.add(predicate);
        }
        if (StringUtils.isNotBlank(type)) {
            Predicate predicate = cb.equal(root.get("type").as(String.class), type);
            predicates.add(predicate);
        }

        //多表的条件查询封装，这是和单表查询的区别
        if (standard != null) {
            if (StringUtils.isNotBlank(standard.getName())) {
                //创建关联对象(需要连接的另外一张表对象)
                //JoinType.INNER内连接(默认)
                //JoinType.LEFT左外连接
                //JoinType.RIGHT右外连接
                Join<Object, Object> join = root.join("standard",JoinType.INNER);

                //join.get("name")连接表字段值
                Predicate predicate = cb.equal(join.get("name").as(String.class), standard.getName());
                predicates.add(predicate);
            }
        }

        //判断结合中是否有数据
        if (predicates.size() == 0) {
            return null;
        }

        //将集合转化为CriteriaBuilder所需要的Predicate[]
        Predicate[] predicateArr = new Predicate[predicates.size()];
        predicateArr = predicates.toArray(predicateArr);

        // 返回所有获取的条件： 条件 or 条件 or 条件 or 条件
        return cb.or(predicateArr);
    }
};

//调用Dao方法进行条件查询
Page<Courier> page = courierDao.findAll(example, pageable);
```

## 简介Spring Data Jpa 简单模糊查询
在一些比较简单的查询条件下，不一定要使用 Specification 接口，比如
```
@Repository
public interface UserRepository extends CrudRepository<User, Integer> {
 
  /**
   * username不支持模糊查询，deviceNames支持模糊查询
   * @param deviceNames 模糊查询deviceNames
   * @param username 用户名称
   * @return {@link List<User>}
   */
  List<User> findAllByDeviceNamesContainingAndUsername(String deviceNames,String username);  
  
  /**
   * 其中username不支持模糊查询，deviceNames支持模糊查询
   * 传入的deviceNames需要在前后添加%，否则可能返回的结果是精确查询的结果
   * @param deviceNames 模糊查询deviceNames
   * @param username 用户名称
   * @return {@link List<User>}
   */
  List<User> findAllByDeviceNamesLikeAndUsername(String deviceNames,String username); 
}
```