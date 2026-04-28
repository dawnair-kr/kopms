package com.koen.kopms_api.model.vo;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.context.annotation.Scope;
import org.springframework.data.annotation.Id;
import org.springframework.stereotype.Component;

import lombok.Data;


// 세션 정보 관리
// @Component("sessionContext")		// sessionContext라는 이름의 스프링 빈으로 등록.
// @Scope("session")				// 사용자의 HTTP 세션당 하나씩 생성

@Data
@Component("sessionContext")
@Scope(value = "session", proxyMode = org.springframework.context.annotation.ScopedProxyMode.TARGET_CLASS)
public class SessionContext implements Serializable {
	
	private static final long serialVersionUID = -5632205201332256765L;
	
	// 사용자 정보
	@Id
	private String empno;		// 사번
	private String levelno;		// LEVEL 번호
	private String classno;		// CLASS 번호
	private String mailno;		// 메일주소
	private String name;		// 성명
	private String intelno;		// 내선번호 - 암복호화
	private String hostname;	// 책임자
	private int notremove;		// 퇴사여부
	private int empOrder;		// 순서
	private int download;		// 다운로드여부
	private String leveldate;	// LEVEL 일자
	private String title;		// 제목
	private String exist;		// 재직여부
	private String ipaddr;		// IP 주소
	private String mCount;		// M카운트
	private String exfaxno;		// 외부팩스번호 - 암복호화
	private String mobilePhn;	// 핸드폰번호 - 암복호화
	private String jikgubName;	// 직급명
	private String vpnYn;		// VPN사용여부
	private String userGubun;	// 구분
	private String deptno;		// 부서코드
	private String extelno;		// 외부전화번호 - 암복호화
	
	// 추가로 필요한 Session 변수들 추가
	private String deptName;		// 부서명
	private String remoteIp;		// 사용자 IP
	private Locale locale;			// Language 설정	
	
	// sso 유효성 체크 관련
	private String ssoToken;
	private boolean authenticated;	// 인증여부
	private LocalDateTime expireAt;
	
	// 위엠비 토큰
	private String wembToken;
	
    // 인증 체크 관련 메서드 --- Start
	// 인증여부
	public boolean isAuthenticated() {
		return authenticated
	            && empno != null
	            && !isExpired();
		/*
	    if (!authenticated || empno == null) {
	        return false;
	    }
	    if (isExpired()) {
	        this.authenticated = false;
	        return false;
	    }
	    return true;
	    */
	}
	
	// 토큰 만료 여부 확인
    public boolean isExpired() {
        if (expireAt == null) {
            return true; // expireAt 없으면 만료로 간주
        }
        return LocalDateTime.now().isAfter(expireAt);		// 현재 시간 > 토큰만료 시간 체크
    }
    
    // 로그인 처리
    public void login(String empno, String name, String ssoToken, LocalDateTime expireAt) {
        this.empno = empno;
        this.name = name;
        this.ssoToken = ssoToken;
        this.authenticated = true;
        this.expireAt = expireAt;
    }
    
    // 로그아웃
    public void logout() {
    	clear();
    }
    // 인증 관련 메서드 --- End
    
	public SessionContext(){
		this.ssoToken = null;
		this.authenticated = false;		
		this.locale = Locale.KOREAN;
	}
	
	// 세션 초기화
	public void clear() {
		// TODO Auto-generated method stubs;
		this.empno = null;
		this.levelno = null;
		this.classno = null;
		this.mailno = null;
		this.name = null;
		this.intelno = null;
		this.hostname = null;
		this.notremove = 0;
		this.empOrder = 0;
		this.download = 0;
		this.leveldate = null;
		this.title = null;
		this.exist = null;
		this.ipaddr = null;
		this.mCount = null;
		this.exfaxno = null;
		this.mobilePhn = null;
		this.jikgubName = null;
		this.vpnYn = null;
		this.userGubun = null;
		this.deptno = null;
		this.extelno = null;
				
		this.deptName = null;
		this.remoteIp = null;
		
		this.ssoToken = null;
        this.authenticated = false;
        this.expireAt = null;
        
        this.locale = Locale.KOREAN;

	}
	
	
}
