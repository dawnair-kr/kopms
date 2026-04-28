
/*
우리 본사 기준 192.168.0.23 bren / bren00807 putty
ls 목록(가로목록 파일및 폴더)
cd 폴더명/  , cd.. 바로상위이동
ll 세로목록( 속성및 권한 까지 보기)



**** 1. application.yml 삭제
--> 삭제후 대응
    application root에서 마우스 우측키 : Run As > Run Configurations > Arguments 탭 > VM agruments = -Dspring.profiles.active=local/test/prod 설정
	
**** 2. pom.xml 설정 추가
		mybatis-spring-boot-starter 다음에 기재할것
        
		<!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-actuator -->
		<!-- 브라우져 테스트 : 접속URL http://192.168.0.23:9040/kopms-api/actuator 
			        정상이면 {"_links":{"self":{"href":"http://192.168.0.23:9040/kopms-api/actuator","templated":false},
					       "beans":{"href":"http://192.168.0.23:9040/kopms-api/actuator/beans","templated":false}
						   ,"conditions":{"href":"http://192.168.0.23:9040/kopms-api/actuator/conditions","templated":false}
						   ,"shutdown":{"href":"http://192.168.0.23:9040/kopms-api/actuator/shutdown","templated":false}
						   ,"configprops":{"href":"http://192.168.0.23:9040/kopms-api/actuator/configprops","templated":false},...... 와 같은 정보가 브라우져에 출력 된다.
		 -->
		<dependency>
		    <groupId>org.springframework.boot</groupId>
		    <artifactId>spring-boot-starter-actuator</artifactId>
		</dependency>

		<!-- https://mvnrepository.com/artifact/org.postgresql/postgresql, 본사 배포 테스트를 위해 postgresql 임시 설정 -->
		<dependency>
		<groupId>org.postgresql</groupId>
		<artifactId>postgresql</artifactId>
		</dependency>
		
		
**** 3. application-local/test/prod.ymd 설정 동기화 체크( 3개파일에 모두 있는지 체크 할것, 작성위치는 file: 항목 다음으로 통일, 띄어쓰기는 반드시 space만 허용 )
1. server: 영역확인하기 ( port ,context-path 등 )
2. spring: > datasource , connection-test-query 등등 확인하기
	
# SSO 토큰 유효성 검증 : 추후 Url 변경 요함
sso:
  validate:
    url: https://portal.kopis.com/sso/validate
    fail-open: false
  http:
    connect-timeout: 2s
    response-timeout: 2s
    request-timeout: 2s
    max-total: 100
    max-per-route: 20

	
	
**** 4. 설정을 고치고 수정하면
	1. Run As > Maven Clean(실행시 C:\workspace\kopms-api\target폴더 삭제됨 )
	2. Run As > Maven Build 
	    최초 시도하면 설정창 팝업( 	Goals 속성값: package 지정 하고 Run 클릭 )
		이미지 바탕화면 > 배포준비.xlsx 파일 참고
		
	3. build성공하면 
	   C:\workspace\kopms-api\target 경로에 kopms-api-0.0.1-SNAPSHOT.jar , kopms-api-0.0.1-SNAPSHOT.jar.original 파일2개 생성되고
	   서버에 반영할 실행파일은 kopms-api-0.0.1-SNAPSHOT.jar
	   
	   
**** 5. start.sh / stop.sh
     1. 각종 명칭 수정
	 2. 경로 수정 : 도메인 , context root , actuator 등등
	 3. -Dspring.profiles.active 등
	 ./bin/kopms-api-0.0.1-SNAPSHOT.jar의 경로지정은  start.sh의 실행경로로 부터 잡는다.
	 예) 여기서는 home > bren > kopms에 *.sh 베포
	                            └ bin : kopms-api-0.0.1-SNAPSHOT.jar    └ => ㅂ
								└ logs : *. log
								
**** 6. logback-spring.xml 로그경로
	로그설정 logback-spring.xml (서버배포경로 확인후 같이 변경수정할것)
	로그경로 이동후 tail -f kopms_api.log
	
	<property name="LOG_PATH" value="/home/bren/kopms/logs"/>
	<property name="LOG_FILE_NAME" value="kopms_api"/>

								  
**** 7. 서버 배포 경로는 고객 확인후 
    예 서울 본사 예) 여기서는 home > bren > kopms에 *.sh 베포
			                          └ bin 폴더 kopms-api-0.0.1-SNAPSHOT.jar 
									  └ logs 폴더
									  start.sh / stop.sh
									  
**** 8. 현재 프로세스가 떠 있는지 확인하기
    ps -ef|grep kopms( kopms가 나오는 목록중에 kopms-api-0.0.1-SNAPSHOT.jar가 있는 2번째 값이 프로세스ID)
	....프로세스 목록....  bren  1154477 1 ****
	
	./stop.sh가 안되면
	kill -9 1154477 (-9 무조건 죽여라)
	
**** 9. 실행과 멈춤
     start.sh / stop.sh가 반드시 위치한 곳에서 명령어 실행
	
*/
	
	 