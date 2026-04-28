package com.koen.kopms_api.common.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.koen.kopms_api.auth.service.SsoService;
import com.koen.kopms_api.exception.SessionNotFoundException;
import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 모든 API 요청은 Interceptor에서 세션 검사 : Controller 진입 "직전" 에
/*
 * 1. HttpSession 존재 확인
 * 2. SessionContext 존재 여부 확인
 * 3. 인증 여부 판단
 * 4. 만료 시 invalidate
 */
		
@Component
@RequiredArgsConstructor
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {
	
	/*
	[요청]
	   ↓
	Interceptor
	   ↓
	1. 세션 존재 확인
	2. SessionContext 획득
	3. isAuthenticated() 호출
	   ↓
	SessionContext 내부
	   - authenticated 체크
	   - empno 체크
	   - expireAt 체크
	   ↓
	실패 시 false
	   ↓
	Interceptor에서 invalidate
	*/
	
    // 세션 스코프 빈 주입을 위한 Provider
    private final Provider<SessionContext> sessionProvider;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // OPTIONS 메서드(CORS 프리플라이트)는 인증 체크 제외
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        
        log.debug("Checking authentication for path: {}", request.getRequestURI());
        // 세션이 없으면 새로 생성하지 말고 null 을 가져오도록 설정
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            log.warn("🚩 [TIMEOUT] 세션 없음");
            throw new SessionNotFoundException("Session expired");
        } else {
            log.debug("🚩 [SESSION ALIVE] ID: {}, MaxInterval: {}", session.getId(), session.getMaxInactiveInterval());
        }
        
        SessionContext sessionContext;

        try {
        	sessionContext = sessionProvider.get();
        } catch (IllegalStateException e) {
            log.warn("🚩 SessionContext 없음");
            session.invalidate();	// 세션 무효화
            throw new SessionNotFoundException("Session expired");
        }
        
        // 인증 여부 확인 (expire 포함)
        if (!sessionContext.isAuthenticated()) {
            log.warn("🚩 인증 실패 또는 토큰 만료: {}", request.getRequestURI());
            sessionContext.clear();   	// 내부 데이터 제거
            session.invalidate();		// 세션 무효화
            throw new SessionNotFoundException("Session expired");
        }

        return true;
    }
    
}