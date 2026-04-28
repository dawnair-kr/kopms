package com.koen.kopms_api.common.session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

/*
 * 단일 WAS 서버 기준 : 단일 WAS 서버 기준
 * 같은 empno로 로그인 시
 * 기존 세션 강제 로그아웃
 * 새 로그인만 유지
 * 세션 만료/로그아웃 시 자동 정리
 * 세션 재생성 방지 (getSession(false) 유지)
 */	

@Component
@Slf4j
public class SessionRegistry {

	// empno → HttpSession
    private final Map<String, HttpSession> userSessionMap = new ConcurrentHashMap<>();
    
    // 세션 등록
    public synchronized void registerSession(String empno, HttpSession newSession) {

        HttpSession oldSession = userSessionMap.get(empno);

        if (oldSession != null && !oldSession.getId().equals(newSession.getId())) {
            log.warn("🚩 기존 세션 강제 종료: empno={}, sessionId={}",
            empno, oldSession.getId());
            oldSession.invalidate();
        }

        userSessionMap.put(empno, newSession);
    }

    // 세션 정보를 삭제
    public void removeSession(HttpSession session) {

        userSessionMap.entrySet().removeIf(entry -> entry.getValue().equals(session));
        log.debug("세션 제거 완료: {}", session.getId());
    }
    
}