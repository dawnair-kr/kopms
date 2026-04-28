package com.koen.kopms_api.auth.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.koen.kopms_api.auth.dto.SsoValidateResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 1. 현재구조는 SSO 서버 API [RestTemplate → 외부 서버] 호출 방식 (HTTP) 으로 임의로 구현됨
 * application.yml
 * 2. WiseAccess 라이브러리 [JAR → 내부 메서드 호출] 직접 호출 방식 (Java SDK) 으로 변경되면 어찌 해야 하나...
 *  
 **/

//-----------------------------  1. 현재구조는 SSO 서버 API [RestTemplate → 외부 서버] 호출 방식 Start 
@Slf4j
@Service
@RequiredArgsConstructor
public class SsoService {

    private final RestTemplate restTemplate;
        
    //@Value("${sso.validate.url}")
    //private String validateUrl;
    //@Value("${sso.validate.fail-open:false}")
    //private boolean failOpen;

    public SsoValidateResponse validate(String token) {

    	//log.debug("SsoService - application.yml - validateUrl {}", validateUrl);
    	//log.debug("SsoService - failOpen {}", failOpen);
    	if (token == null || token.isBlank()) {
            log.warn("SSO validation failed - empty token");
            //return false;
            return null;
        }

        try {
        	// HTTP 요청 구성 : SSO 서버가 JSON 받는다면...
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = Map.of("token", token);

            HttpEntity<Map<String, String>> request =
                    new HttpEntity<>(body, headers);
            
            // 동기 방식 SSO 호출
            ResponseEntity<SsoValidateResponse> response =
                    restTemplate.postForEntity(
                            //validateUrl,
                            "aaaaaa",
                    		request,
                            SsoValidateResponse.class
                    );
            
            // HTTP 상태 코드 체크 : 200~299만 성공 처리
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("SSO validation failed - HTTP status: {}",
                         response.getStatusCode());
                //return false;
                return null;
            }

            SsoValidateResponse result = response.getBody();
            
            // Body null 체크
            if (result == null) {
                log.warn("SSO validation failed - empty body");
                //return false;
                return null;
            }

            // 유효성 필드 체크
            if (!result.valid()) {
                log.warn("SSO invalid token for userId={}", result.empno());
                //return false;
                return null;
            }
            
            // 시간 만료 체크
            if (result.expireAt() == null ||
                result.expireAt().isBefore(LocalDateTime.now())) {
                log.warn("SSO token expired for userId={}", result.empno());
                //return false;
                return null;
            }            
            //return true;
            return result;
        
        } catch (ResourceAccessException e) {
            // timeout or connection error
        	log.warn("SSO server unreachable");
        	
        	// Fail-Open 전략 : Fail-Open (true): "서버가 죽어도 일단 다 통과. 임시로 유효한 응답을 강제로 만들어 리턴. (서비스 중단을 막기 위함)
            //if (failOpen) {
        	if (true) {
                log.warn("Fail-Open activated");
                return new SsoValidateResponse(
                        true,									// 유효함(valid)으로 간주
                        null,									// 사번 몰라
                        LocalDateTime.now().plusMinutes(60)		// "지금부터 1시간 동안만" 임시 허용!
                );
            }

            return null;

        } catch (Exception e) {
            log.error("SSO validation unexpected error", e);
            //return false;
            return null;
        }
        
    }
}

// ----------------------------- 2. 이하 WiseAccess 라이브러리 Start
/**
 * 1. WiseAccess 내부 통신 방식
 * 	- WAS → SSO 서버 통신하는지?
 * 		: 설정 파일에 URL 있는지...
 * 	- 아니면 로컬 검증인지?
 * 		: token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... 관리 될듯..
 * 2. 설정 파일 필요 여부
 * 	예) 	wiseaccess.properties
 *		sso.conf 
 * 
 */

/*
@Slf4j
@Service
public class SsoService {

    public SsoValidateResponse validate(String token) {

        if (token == null || token.isBlank()) {
            log.warn("SSO validation failed - empty token");
            return null;
        }

        try {
            // WiseAccess 라이브러리 사용
            SSO sso = new SSO();

            int result = sso.vertifyToken(token);

            if (result < 0) {
                log.warn("SSO validation failed - invalid token");
                return null;
            }

            // JSP의 getValueUserID()
            String empno = sso.getValueUserID();

            if (empno == null || empno.isBlank()) {
                log.warn("SSO validation failed - no userId");
                return null;
            }

            // expireAt은 라이브러리에서 안주면 직접 설정
            return new SsoValidateResponse(
                    true,
                    empno,
                    LocalDateTime.now().plusHours(2) // 정책값
            );

        } catch (Exception e) {
            log.error("SSO validation error", e);
            return null;
        }
    }
}
*/
//----------------------------- 이하 WiseAccess 라이브러리 ----- End
