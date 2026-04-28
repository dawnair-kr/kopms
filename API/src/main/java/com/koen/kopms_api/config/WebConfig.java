package com.koen.kopms_api.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.koen.kopms_api.common.interceptor.AuthInterceptor;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    
    // application.yml 시리즈에서 설정한 값을 가져옵니다.
    // 값이 없을 경우를 대비해 :http://localhost:5173 기본값.
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
//    private String[] allowedOrigins;
    private List<String> allowedOrigins; // 리스트로 선언
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")			// API 경로 지정
//                .allowedOrigins("http://localhost:5173") // UI [Vue] 서버 주소
//        		.allowedOrigins(allowedOrigins) 
        		.allowedOrigins(allowedOrigins.toArray(new String[0])) // 주입받은 변수 사용
//        		.allowedOrigins(allowedOrigins, "http://localhost:3000") // 테스트 위해 5173 외에 3000도 추가!
                .allowedMethods("*")
                .allowCredentials(true); // 쿠키(세션) 허용 필수!
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/kopms-api/**")             // 적용할 경로 (예: 모든 API) // context-path : /kopms-api를 뺀 나머지 경로
                .excludePathPatterns(                   // 제외할 경로
//                	"/ssoLogin",                    	// 로그인 API : LoginController가 @RequestMapping("/")이고 메서드가 /ssoLogin 이므로
//                	"/mock-sso/**",                    	// Mock(local) 로그인 테스트 API 
//                	"/index.html",      // 메인 페이지 허용
//                 "/assets/**",       // JS, CSS 등 빌드 파일 허용
//                 "/favicon.ico",     // 아이콘 허용
//                 "/static/**",
//                 	"/images/*",
//                 	"/*.svg",
//                 	"/"
                		"/kopms-api/ssoLogin"
                );
    }
    
    /* 정적 리소스 패핑 */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
    	
    	/**
    	 * 하기 순서 바꾸지 마시요
    	 */
    	// upload
    	String location = "file:///" + uploadDir.replace("\\", "/");
    	registry.addResourceHandler("/upload/**")
    			.addResourceLocations( location );
    	
    	// static
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
    
    @PostConstruct // 의존성 주입이 완료된 후 실행됨
    public void init() {
    	log.info(">>>> 현재 적용된 CORS Origin : {}" , allowedOrigins);
//    	log.info(">>>> 현재 적용된 CORS Origin : {}", java.util.Arrays.toString(allowedOrigins));    	
    }
    
    
}