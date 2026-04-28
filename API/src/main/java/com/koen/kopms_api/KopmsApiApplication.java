package com.koen.kopms_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;


import lombok.extern.log4j.Log4j2;


//exclude 설정을 통해 DB 자동 구성을 제외합니다. 2026.01.09
//@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
//public class KopmsApiApplication {
//
//	public static void main(String[] args) {
//		SpringApplication.run(KopmsApiApplication.class, args);
//	}
//
//}

@Log4j2
@SpringBootApplication
//@MapperScan("com.koen.kopms_api.common.**.dao")		// 매퍼 인터페이스 자동 스캔
//@MapperScan("com.koen.kopms_api.**.dao")		// 매퍼 인터페이스 자동 스캔
//@MapperScan(
//    basePackages = "com.koen.kopms_api.**.dao",
//    // 💡 중요: 인터페이스에 @Mapper 어노테이션이 붙은 것만 스캔하도록 제한
//    annotationClass = org.apache.ibatis.annotations.Mapper.class 
//)
public class KopmsApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(KopmsApiApplication.class, args);
		
		log.info("###################################################");
		log.info("## Service Application KopmsApiApplication API Server Stated ##");
		log.info("###################################################");
	}

}
