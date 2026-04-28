package com.koen.kopms_api.common.login.controller;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.xssf.streaming.SXSSFRow;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.koen.kopms_api.common.login.service.LoginService;
import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.util.IpUtil;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;


/**
 * 로그인 컨트롤러
 * API 명명 규칙: /api/codes
 * "/
 */

@Slf4j                  
@RestController
@RequestMapping("/kopms-api")
public class LoginController {
	
	@Autowired
	private LoginService loginService;
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;

	
	@PostMapping("/ssoLogin")
	public CommonResponse<?> ssoLogin(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//		log.info("LoginController - ssoLogin : {}", searchMap);
		
		String clientIp = IpUtil.getClientIP(request);
    	searchMap.put("clientIp", clientIp);
    	
    	HashMap<String, Object> loginInfo = loginService.ssoLogin(request, searchMap);        
        
        return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), loginInfo);
	}

	/**
     * 메뉴조회
     * POST getMenus
     */
    @PostMapping("/getMenus")
    public CommonResponse<?> getMenus(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("LoginController - getMenus for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> menus = loginService.getMenus(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), menus);
    }
	/**
     * 메뉴조회
     * POST getWemb
     */
    @PostMapping("/getWemb")
    public CommonResponse<?> getWemb(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("LoginController - getMenus for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> token = loginService.getWemb(searchMap);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), token);
    }

    /**
    * 
    */
    @PostMapping("/getLoginHistory")
    public CommonResponse<?> getLoginHistory(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("LoginController - getLoginHistory for searchMap : {}", searchMap);
    	
    	HashMap<String, Object> resultMap = loginService.getLoginHistory(searchMap);
    	
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    
    /**
     * 메뉴 호그기록
     * POST setLogMenu
     */
    @PostMapping("/setLogMenu")
    public CommonResponse<?> setLogMenu(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("LoginController - setLogMenu for searchMap : {}", searchMap);
    	
    	//HashMap<String, Object> menus = loginService.setLogMenu(searchMap);
    	int rtn = 0;
    	rtn = loginService.setLogMenu(searchMap);
    	
    	HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("isOk", rtn);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }

    /**
     * insertMenu : Test
     * POST
     */
    @PostMapping("/insertMenu")
    public CommonResponse<?> insertMenu(HttpServletRequest request, @RequestBody HashMap<String, Object> searchMap) throws Exception {

//    	log.info("LoginController - insertMenu for searchMap : {}", searchMap);
    	
    	int rtn = 0;
    	rtn = loginService.insertMenu(searchMap);
    	
    	HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("isOk", rtn);
		
    	return new CommonResponse<HashMap<String, Object>>(0, messageUtil.getMessage(ExceptionMsg.SUCC_QUERY), resultMap);
    }
    
    /**
     * downloadMenusExcel : Test
     * POST
     */
    @PostMapping("/downloadMenusExcel")
    public void downloadMenusExcel(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   @RequestBody HashMap<String, Object> searchMap) throws Exception {
        
        log.info("LoginController - downloadMenusExcel for searchMap : {}", searchMap);
        
        try {
            // 1. 서비스 호출 및 데이터 추출
            HashMap<String, Object> resultMap = loginService.getMenuList(searchMap);
            
//            log.info("LoginController - downloadMenusExcel for resultMap : {}", resultMap);
            
            List<HashMap<String, Object>> menuList = (List<HashMap<String, Object>>) resultMap.get("menuList");

            if (menuList == null || menuList.isEmpty()) {
            	// 1. 응답 타입 설정 (br_trans가 FileReader를 돌리게 만드는 트리거)
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_OK);

                // 2. 공통 응답 객체 생성
                CommonResponse<Object> errorRes = new CommonResponse<>(
                    -1, // 0보다 작은 값으로 설정하여 프론트에서 에러로 인지하게 함
                    "조회된 데이터가 없습니다.", 
                    null
                );

                // 3. JSON 출력 및 종료
                new ObjectMapper().writeValue(response.getWriter(), errorRes);
                return; // 이후 엑셀 생성 로직을 타지 않도록 반드시 리턴
            }

            // 2. 엑셀 워크북 생성 (SXSSF 권장 - 메모리 효율적)
            try (SXSSFWorkbook workbook = new SXSSFWorkbook(100);
                 OutputStream out = response.getOutputStream()) {
                
                SXSSFSheet sheet = workbook.createSheet("Menu Info");
                
                // 헤더 작성
                // MENU_CODE, MENU_NO, MENU_NAME, MENU_LEVEL, UP_MENU_NO, MENU_URL, MENU_IMAGE, USE_YN, TOP_MENU_LIST, TOP_NO 
                String[] headers = {"메뉴코드", "메뉴번호", "메뉴명", "메뉴레벨", "상위메뉴번호", "메뉴URL", "메뉴이미지", "사용여부", "최상위메뉴목록", "최상위번호"};
                SXSSFRow headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    headerRow.createCell(i).setCellValue(headers[i]);
                }

                // 데이터 작성
                int rowIdx = 1;
                for (HashMap<String, Object> menu : menuList) {
                    SXSSFRow row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(String.valueOf(menu.getOrDefault("menuCode", "")));
                    row.createCell(1).setCellValue(String.valueOf(menu.getOrDefault("menuNo", "")));
                    row.createCell(2).setCellValue(String.valueOf(menu.getOrDefault("menuName", "")));
                    row.createCell(3).setCellValue(String.valueOf(menu.getOrDefault("menuLevel", "")));
                    row.createCell(4).setCellValue(String.valueOf(menu.getOrDefault("upMenuNo", "")));
                    row.createCell(5).setCellValue(String.valueOf(menu.getOrDefault("menuUrl", "")));
                    row.createCell(6).setCellValue(String.valueOf(menu.getOrDefault("menuImage", "")));
                    row.createCell(7).setCellValue(String.valueOf(menu.getOrDefault("useYn", "")));
                    row.createCell(8).setCellValue(String.valueOf(menu.getOrDefault("topMenuList", "")));
                    row.createCell(9).setCellValue(String.valueOf(menu.getOrDefault("topNo", "")));
                }

                // 3. 응답 헤더 설정
                String fileName = URLEncoder.encode("메뉴목록_" + System.currentTimeMillis(), "UTF-8") + ".xlsx";
                String encodedFileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
                response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFileName);

                // 4. 스트림 전송
                workbook.write(out);
                out.flush();
                workbook.dispose(); // 임시파일 삭제
            }

        } catch (Exception e) {
            //log.error("Excel Download Error: ", e);
            
        	// 1. 응답 타입을 반드시 JSON으로 설정 (br_trans의 data.type == "application/json" 체크 통과용)
            response.setContentType("application/json;charset=UTF-8");
            
            // 2. HTTP 상태 코드는 200으로 보냅니다. 
            // (이유: br_trans 소스상 4xx, 5xx 에러는 catch_func로 빠져서 Blob 내부 메시지를 읽기 복잡해집니다.)
            response.setStatus(HttpServletResponse.SC_OK); 
            
            // 3. br_trans가 내부에서 파싱할 JSON 객체 생성
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("code", -1); // 0보다 작은 값 (에러 의미)
            errorRes.put("message", "파일 생성 실패: " + e.getMessage());
            errorRes.put("data", null);
            
            // 4. 출력
            new ObjectMapper().writeValue(response.getWriter(), errorRes);        
        
        }
    }
    
    
    
}
