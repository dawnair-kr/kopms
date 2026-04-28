package com.koen.kopms_api.config.i18n;

import java.util.HashMap;
import java.util.Map;

public class ExceptionMsg {

	// --------------------------------------------------------------------
	// 정상 코드 : 1000~1999, 오류 코드 : 정상코드 이외
	// 고정코드 : 000, 900, 999, 1000, 1001
	// --------------------------------------------------------------------
	// 정보조회 오류
	public static final int NO_SEARCH_DATA 	= 000; // base
	public static final int ERR_SESSION_NULL 	= 900; // base
	public static final int ERR_TOPIC_EXIST	= 901; // base
	public static final int ERR_FILE_NOT_FOUND= 902; // base
	public static final int ERR_SERVER_ERROR 	= 999; // base

	// 로그인 관련 오류
	public static final int NOT_REGISTER_USER 		= 201;
	public static final int INVALIDATE_PASSWORD 		= 202;
	public static final int NOT_PASSWORD_INITIALIZE 	= 203;
	public static final int INVALID_PASSWORD_5TIME	= 204;
	public static final int NOT_AUTH_COMPANY	= 205;
	public static final int INVALID_IPADDRES	= 206;
	// Tran 성공 Message
	public static final int SUCC_NOT_FOUND = 1000; // base
	public static final int SUCC_QUERY = 1001; // base
	
	// Biz
	public static final int DUP_EVALUATOR = 2000; 	// 외부 평가위원 ; External Evaluator
	
	
	private static final Map<Integer, String[]> messages;

	static {
		messages = new HashMap<Integer, String[]>();

		messages.put(NO_SEARCH_DATA, new String[] { "조회결과가 없습니다.", "정상" });
		messages.put(ERR_SESSION_NULL, new String[] { "로그인 후에 사용하시기 바랍니다.", "로그인에러" });
		messages.put(ERR_TOPIC_EXIST, new String[] { "이미 생성된 주제어입니다.", "채팅오류" });
		messages.put(ERR_SERVER_ERROR, new String[] { "서버처리 중 오류가 발생하였습니다.", "서버오류" }); // E999
		
		messages.put(NOT_REGISTER_USER, new String[] { "등록되지 않은 사용자입니다.", "사용자인증" });
		messages.put(INVALIDATE_PASSWORD, new String[] { "비밀번호 오류입니다.\n관리자에게 문의 하십시요", "사용자인증" });
		messages.put(NOT_PASSWORD_INITIALIZE, new String[] { "비밀번호 초기화오류 입니다.\n비밀번호를 초기화 하십시요", "사용자인증" });
		messages.put(INVALID_PASSWORD_5TIME, new String[] { "비밀번호 오류 5회 초과입니다.\n비밀번호를 초기화 하십시요", "사용자인증" });
		messages.put(INVALID_IPADDRES, new String[] { "등록되지 IP ADRESS 입니다.\n관리자에게 문의 하십시요", "사용자인증" });
		
		messages.put(ERR_FILE_NOT_FOUND, new String[] { "대상 파일이 존재하지 않습니다.", "파일업로드" });
		
		messages.put(SUCC_QUERY, new String[] { "조회가 완료되었습니다.", "정보조회" });
		messages.put(SUCC_NOT_FOUND, new String[] { "조건에 일치하는 정보가 없습니다.", "정보조회" });
		
		messages.put(DUP_EVALUATOR, new String[] { "이미 등록된 신청정보입니다.", "정보확인" });
	}

	/**
	 * 사용자 출력용 메시지
	 * 
	 * @param code
	 * @return
	 */
	public static String getUserMessage(int code) {
		return messages.get(code)[0];
	}

	/**
	 * 사용자 출력용 메시지
	 * 
	 * @param code
	 * @return
	 */
	public static String getUserMessage(int code, String key) {
		String message = messages.get(code)[0] + " : " + key;
		return message;
	}

	/**
	 * 코드에 대한 문장
	 * 
	 * @param code
	 * @return
	 */
	public static String getCodeText(int code) {
		return messages.get(code)[1];
	}

	/**
	 * 코드를 문자열로 변환한다.
	 * 
	 * @param code
	 * @return '(code:codeText) message' 형식
	 */
	public static String toString(int code) {
		return String.format("(%d:%s) %s", code, getCodeText(code), getUserMessage(code));
	}

	public static boolean chkErr(int code) {
		String[] msg = messages.get(code);
		if (msg != null) {
			return true;
		}
		return false;
	}

//	public static ModelAndView commExcpetionHand(ModelAndView modelView, Exception e) {
//        if (!AppConstant.IS_REAL) {
//            e.printStackTrace();
//        }
//        modelView.setViewName("err/erComm");s
//        if (e.getMessage() != null && ExceptionMsg.chkErr(e.getMessage())) {
//            modelView.addObject("ERR_CODE", e.getMessage());
//        }
//        else {
//            modelView.addObject("ERR_CODE", ExceptionMsg.ERR_SERVER_ERROR);
//        }
//        return modelView;
//    }
	
}