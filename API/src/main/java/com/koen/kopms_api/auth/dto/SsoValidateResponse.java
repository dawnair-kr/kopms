package com.koen.kopms_api.auth.dto;


import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/*
 * SSO 서버 응답을 받기 위한 객체 : SSO Token 유효성 체크
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SsoValidateResponse(
		
		/* 서버 응담구조 예
		{
		  "valid": true,
		  "empno": "admin",
		  "expireAt": "2026-02-27T12:00:00",
		}
		*/
        boolean valid,		// 토큰 유효 여부 : true / false
        String empno,
        LocalDateTime expireAt		// 세션의 "논리적 만료 시간(Timestamp)", 현재는 WAS 세션과 별개로, 애플리케이션이 직접 통제하는 보안 만료 시간, 즉 언제까지 유효한지 애플리케이션이 직접 관리하는 보안 타이머

) {}