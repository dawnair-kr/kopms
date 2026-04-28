package com.koen.kopms_api.common.listener;

import org.springframework.stereotype.Component;

import com.koen.kopms_api.common.session.SessionRegistry;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 세션이 사라지는 시점(타임아웃 발생 또는 session.invalidate() 호출 시)에 자동 실행.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionListener implements HttpSessionListener {

    private final SessionRegistry sessionRegistry;

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
    	
    	HttpSession session = se.getSession();
    	
    	log.debug("🚩 sessionDestroyed 호출됨: {}", session.getId());
    	// 세션 제거
        sessionRegistry.removeSession(session);
    }
}