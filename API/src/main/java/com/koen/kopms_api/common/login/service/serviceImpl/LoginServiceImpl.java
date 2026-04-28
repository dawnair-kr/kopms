package com.koen.kopms_api.common.login.service.serviceImpl;

//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koen.kopms_api.auth.dto.SsoValidateResponse;
import com.koen.kopms_api.auth.service.SsoService;
import com.koen.kopms_api.common.login.dao.LoginDao;
import com.koen.kopms_api.common.login.service.LoginService;
import com.koen.kopms_api.common.session.SessionRegistry;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.exception.BizException;
import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import kr.co.wemb.WembSSO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {
	
	private final Provider<SessionContext> sessionProvider;
    
	private final LoginDao loginDao;	// MyBatis Mapper 인터페이스
	
	private final SsoService ssoService;
	
	private final SessionRegistry sessionRegistry;
	
	@Value("${file.signkey-dir}")
    private String signkeyDir;
	
	@Value("${spring.profiles.active:default}") 	// 값이 없으면 "default"를 사용
	private String activeProfile;
	
	// ssoLogin
	@Override
	@Transactional
	public HashMap<String, Object> ssoLogin(HttpServletRequest request, HashMap<String, Object> searchMap) throws Exception {
		
		log.info("LoginServiceImpl - ssoLogin for searchMap: {}", searchMap);
		
		// 0. Provider를 통해 현재 세션의 Context를 가져옴 
	    SessionContext sessionContext = sessionProvider.get();
		
		// local, dev, prod
		log.info("LoginServiceImpl - 현재 활성화된 프로파일: " + activeProfile);
		
		String token = (String) searchMap.get("ssoToken");
		String loginType = (String) searchMap.get("loginType");
		String clientIp = (String) searchMap.get("clientIp");
		
		if ( token == null || token.isEmpty() ) {
			throw new BizException(ExceptionMsg.NOT_REGISTER_USER);
		}		
		
		HashMap<String, Object> ssoMember = new HashMap<String, Object>();
		
		SsoValidateResponse ssoResponse = null;
		// 1. 토큰 검증
		if ("local".equals(activeProfile)) {
		    // 로컬 환경에서만 실행할 특별한 로직 (예: 테스트용 데이터 생성)
			log.info("LoginServiceImpl - 토큰 유효성 체크 Local X ~~~~~~~");			
			ssoResponse = new SsoValidateResponse(
		            true,
		            token,
		            LocalDateTime.now().plusHours(2)	// 지금부터 2시간 뒤"를 만료 시간으로 설정
		    );
		
		} else if ("test".equals(activeProfile)) {
		    // 로컬 환경에서만 실행할 특별한 로직 (예: 테스트용 데이터 생성)
			log.info("LoginServiceImpl - 토큰 유효성 체크 Local X ~~~~~~~");			
			ssoResponse = new SsoValidateResponse(
		            true,
		            token,
		            LocalDateTime.now().plusHours(2)	// 지금부터 2시간 뒤"를 만료 시간으로 설정
		    );
		
		} else {
			// 운영/개발 → 실제 포털 검증
			log.info("LoginServiceImpl - 토큰 유효성 체크 운영/개발 ~~~~~~~");			
			ssoResponse = ssoService.validate(token);
		}
				
		// 검증 실패
		if (ssoResponse == null || !ssoResponse.valid()) {
		 	throw new BizException(ExceptionMsg.NOT_REGISTER_USER);
		}
		
		// 사용자 ID 추출 (JSP의 getValueUserID)
		String empno =  ssoResponse.empno();
		
		// 2 록그인 사용자 정보  
		HashMap<String, Object> loginParam = new HashMap<>();
		loginParam.put("empno", empno);		
		
		HashMap<String, Object> memberInfo = loginDao.selectMember(loginParam);
		// 등록되지 않은 사용자 오류
		if (memberInfo == null) {
			throw new BizException(ExceptionMsg.NOT_REGISTER_USER);
		}
		
		// USER_GUBUN : M- 일반사용자, O - 외부평가위원, I - 내부평가위원, A - 시스템관리자, V - 업무관리자, E - 본사평가위원(사업검토회의), H - 업무지원
		String userGubun = (String) memberInfo.get("userGubun");
		String savedIp = (String) memberInfo.get("ipaddr");
		
		// 등록되지 않은 사용자 IP 오류
		// 시스템관리자[A] & 접근 IP 와 부여된 IP 가 다른 경우 업무관리자로[V] 권한 변경
		if ( Objects.equals(userGubun, "A") ) {			
			if ( !Objects.equals(savedIp, clientIp) ) {
				userGubun = "V";
				memberInfo.put("userGubun", userGubun);
			}			
		} else {
			if (!Objects.equals(savedIp, clientIp)) {
			    throw new BizException(ExceptionMsg.INVALID_IPADDRES);
			}
		}
		
		memberInfo.put("remoteIp", clientIp);
		
		//log.info("LoginServiceImpl - SessionContext 채우기 ~~~~~~ ");		
		// 3. 로그인 성공 시 SessionContext 채우기
		sessionContext.login( 
			(String) memberInfo.get("empno"), 
			(String) memberInfo.get("name"),
			token,
			ssoResponse.expireAt()
		);		
		
		sessionContext.setLevelno( (String) memberInfo.get("levelno") );
		sessionContext.setClassno( (String) memberInfo.get("classno") );
		sessionContext.setMailno( (String) memberInfo.get("mailno") );
		sessionContext.setIntelno( (String) memberInfo.get("intelno") );
		sessionContext.setHostname( (String) memberInfo.get("hostname") );
		
		// int형 캐스팅 주의 (null 방어)
		Number notRemove = (Number) memberInfo.get("notremove");
        sessionContext.setNotremove(notRemove != null ? notRemove.intValue() : 0);
        Number empOrdere = (Number) memberInfo.get("empOrder");
        sessionContext.setEmpOrder(empOrdere != null ? empOrdere.intValue() : 0);
        Number downloade = (Number) memberInfo.get("download");
        sessionContext.setDownload(downloade != null ? downloade.intValue() : 0);
		
		sessionContext.setLeveldate( (String) memberInfo.get("leveldate") );
		sessionContext.setTitle( (String) memberInfo.get("title") );
		sessionContext.setExist( (String) memberInfo.get("exist") );
		sessionContext.setIpaddr( (String) memberInfo.get("ipaddr") );		
		sessionContext.setMCount( (String) memberInfo.get("mCount") );
		sessionContext.setMobilePhn( (String) memberInfo.get("mobilePhn") );
		sessionContext.setJikgubName( (String) memberInfo.get("jikgubName") );		
		sessionContext.setVpnYn( (String) memberInfo.get("vpnYn") );
		sessionContext.setUserGubun( (String) memberInfo.get("userGubun") );
		sessionContext.setDeptno( (String) memberInfo.get("deptno") );		
		sessionContext.setExtelno( (String) memberInfo.get("extelno") );
		
		sessionContext.setDeptName( (String) memberInfo.get("deptName") );
		sessionContext.setRemoteIp( (String) memberInfo.get("remoteIp") );		
		
		// menu 정보
		String userType = "M";
		// A - 시스템관리자, H - 업무지원
		HashMap<String, Object> menuParam = new HashMap<>();
		if ( Objects.equals(userGubun, "A") || Objects.equals(userGubun, "H") ) {
			userType = "";
		} else {
			userType =  userGubun;
		}
		
		menuParam.put("userType", userType );
		//log.info("LoginServiceImpl - login for menuParam: {}", menuParam);
		
		List<HashMap<String, Object>> menus = loginDao.selectMenus(menuParam);
		
		// 메뉴권한정보
		//log.info("LoginServiceImpl - 권한정보 조회 작업예정 ~~~~~~ ");
		HashMap<String, Object> authParam = new HashMap<>();
		authParam.put("empno", (String) memberInfo.get("empno") );
		authParam.put("deptno", (String) memberInfo.get("deptno") );
		authParam.put("userType", userType );
		//log.info("LoginServiceImpl - login for authParam: {}", authParam);
		
		List<HashMap<String, Object>> menuAuth = loginDao.selectMenuAuth(authParam);
		
		// 레노빗 세션 만들기(토큰)
		// [ 기본 키로 토큰 생성 (15 초 유효 )] 
		WembSSO wembSSO = new WembSSO(); 
		String token1 = wembSSO.signWithKey(empno, 15000);  
		// [ 파일 경로에서 읽은 비밀 키로 토큰 생성 ] 
		String keyFilePath = signkeyDir + "signKey.txt"; 
		log.debug("Wemb token keyFilePath :: [{}]", keyFilePath);
		// 키 파일 절대경로 
		String wembToken = wembSSO.signWithKeyPath(empno, 15000, keyFilePath);
		sessionContext.setWembToken(wembToken);
		memberInfo.put("wembToken" , wembToken);
		log.debug("Wemb token :: [{}] : [{}]", empno, wembToken);
		
		
		
		// 결과
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("memberInfo", memberInfo);
		resultMap.put("menus", menus);
		resultMap.put("menuAuth", menuAuth);
		
		// sessionContext 정보 Get
		// 로그인 성공 : 로그인 이력
		HashMap<String, Object> userLog = new HashMap<String, Object>();
		userLog.put("empId", empno);
		userLog.put("empName", (String) memberInfo.get("name"));
		userLog.put("ipaddr", (String) memberInfo.get("remoteIp"));
		
		try {
			loginDao.upsertLoginHistory(userLog);
		} catch (Exception e) {
		    log.error("로그인 이력 저장 실패", e);
		}
		
		// 로그인 성공 후 세션 생성
		HttpSession session = request.getSession(true);
		// 세션 고정 공격 방지
		request.changeSessionId();		
		// 세션 가져오기
		session = request.getSession(false);
		if (session == null) {
		    //throw new IllegalStateException("로그인 후 세션이 존재하지 않습니다.");
			throw new BizException(ExceptionMsg.NOT_REGISTER_USER);
		}
		// 동시 로그인 제한 등록 : empno + session
		sessionRegistry.registerSession(sessionContext.getEmpno(), session);
		return resultMap;
	}
	
	// getMenus
	@Override
	public HashMap<String, Object> getMenus(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("LoginServiceImpl - getMenus for searchMap: {}", searchMap);	

		List<HashMap<String, Object>> menus = loginDao.selectMenus(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("menus", menus);
		
		return resultMap;
	}
	// getMenus
	@Override
	public HashMap<String, Object> getWemb(HashMap<String, Object> searchMap) throws Exception {
		
		// SessionContext sessionContext = sessionProvider.get();
		// String empno = sessionContext.getEmpno();
		String empno = "manager";
		// 레노빗 세션 만들기(토큰)
		// [ 기본 키로 토큰 생성 (15 초 유효 )] 
		WembSSO wembSSO = new WembSSO(); 
		String token1 = wembSSO.signWithKey(empno, 15000);  
		// [ 파일 경로에서 읽은 비밀 키로 토큰 생성 ] 
		String keyFilePath = signkeyDir + "signKey.txt"; 
		log.debug("Wemb token keyFilePath :: [{}]", keyFilePath);
		// 키 파일 절대경로 
		String wembToken = wembSSO.signWithKeyPath(empno, 15000, keyFilePath);
		
		log.debug("Wemb token :: [{}] : [{}]", empno, wembToken);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("wembToken", wembToken);
		
		return resultMap;
	}
	
	// LoginHistory
	@Override
	public HashMap<String, Object> getLoginHistory(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("LoginServiceImpl - getLoginHistory for searchMap: {}", searchMap);	

		List<HashMap<String, Object>> logInHis = loginDao.selectLoginHistory(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("logInHis", logInHis);
		
		return resultMap;
	}
		
	
	// setLogMenu
	@Override
	public int setLogMenu(HashMap<String, Object> searchMap) throws Exception {
		
		//log.info("LoginServiceImpl - setLogMenu for searchMap: {}", searchMap);	
		
		int result = 0;
		result = loginDao.upsertLogMenu(searchMap);
		return result;
		
	}
	
	// insertMenu : import Test
	@Override
	@Transactional
	public int insertMenu(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("LoginServiceImpl - insertMenu for searchMap: {}", searchMap);	
		
		List<HashMap<String, Object>> menuList = (List<HashMap<String, Object>>) searchMap.get("importMenu");
		
//		log.info("LoginServiceImpl - insertMenuList size: {}", menuList.size());

	    int result = 0;

	    for (HashMap<String, Object> map : menuList) {
	        result += loginDao.upsertMenu(map);
	    }

	    return result;
		
	}
	
	// MenuList Excel Down
	@Override
	public HashMap<String, Object> getMenuList(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("LoginServiceImpl - getMenuList for searchMap: {}", searchMap);	

		List<HashMap<String, Object>> menuList = loginDao.selectMenuList(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("menuList", menuList);
		
		return resultMap;
	}

}
