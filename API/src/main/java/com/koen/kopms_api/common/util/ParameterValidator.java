package com.koen.kopms_api.common.util;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class ParameterValidator {

	private static final String NUMBER_REGEX = "^[0-9]+$";
	private static final String FLOAT_REGEX = "^(?:0*\\d{1,2})(?:\\.\\d{0,2}0*)?$|^(?:0*\\.)(?:\\d{1,2}0*)$";

//    public void parameterCheck(String key, String value) throws Exception {
//    	
//    	if ((value == null) || ("".equals(value))) {
//            throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, key);
//        }
//    }
//
//    public void parameterCheck(String key, Integer value) throws Exception {
//    	
//    	if ((value == null) || (value == 0)) {
//            throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, key);
//        }
//    }
//
//    public void parameterCheck(String key, String value, boolean numCheck, boolean floatCheck) throws Exception {
//
//    	try {
//        	parameterCheck(key, value);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, key);
//    	}
//    	
//    	try {
//    		float testFloat = Float.parseFloat(value);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_NUMBER, key);
//    	}    	
//    }
//
//    // 길이 체크
//    public void parameterCheck(String key, String value, int Length) throws Exception {
//    	
//    	try {
//        	parameterCheck(key, value);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, key);
//    	}
//    	
//    	if (value.length() != Length) {
//            throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_LENGTH, key);
//    	}
//    }
//
//    // 숫자형 체크
//    public void parameterCheck(String key, String value, boolean numCheck) throws Exception {
//    	
//    	try {
//        	parameterCheck(key, value);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, key);
//    	}
//    	
//    	if (!Pattern.matches(NUMBER_REGEX, value)) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_NUMBER, key);
//    	}
//    }
//    
//    public void parameterCheck(String key, String value, int Length, boolean dateCheck) throws Exception {
//
//    	try {
//        	parameterCheck(key, value);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, key);
//    	}
//    	
//    	try {
//    		if (Length != 0 ) parameterCheck(key, value, 8);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_LENGTH, key);
//    	}
//    	
//    	try {
//    		if (Length != 0 ) parameterCheck(key, value, true);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_NUMBER, key);
//    	}
//
//    	new DateUtil();
//		String checkDate = DateUtil.addDate(value, 0);
//    	if (!value.equals(checkDate)) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_DATE, key);
//    	}
//	}
//    
//    public void parameterCheck(String fromKey, String fromValue, String toKey, String toValue, int Length, int monthGap) throws Exception {
//
//    	try {
//        	parameterCheck(fromKey, fromValue);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, fromKey);
//    	}
//    	try {
//        	parameterCheck(toKey, toValue);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER, toKey);
//    	}    	
//    	
//    	try {
//    		if (Length != 0 ) parameterCheck(fromKey, fromValue, Length);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_LENGTH, fromKey);
//    	}
//    	try {
//    		if (Length != 0 ) parameterCheck(toKey, toValue, Length);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_LENGTH, toKey);
//    	}    	
//    	
//    	try {
//    		if (Length != 0 ) parameterCheck(fromKey, fromValue, true);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_NUMBER, fromKey);
//    	}
//    	try {
//    		if (Length != 0 ) parameterCheck(toKey, toValue, true);
//    	}
//    	catch (Exception e) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_NUMBER, toKey);
//    	}    	
//
//    	new DateUtil();
//		String checkDate = DateUtil.addDate(fromValue, 0);
//    	if (!fromValue.equals(checkDate)) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_DATE, fromKey);
//    	}
//		checkDate = DateUtil.addDate(toValue, 0);
//    	if (!toValue.equals(checkDate)) {
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_DATE, toKey);
//    	}
//    	    	
//    	// 왼쪽 값을 기준으로 1, 0, -1 로, 클때는 1, 같으면 0, -1은 작을때,
//    	int compare1 = fromValue.compareTo(toValue);
//    	if( compare1 > 0 ){
//    		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_FROMTODATE, toKey);
//    	}
//    	
//    	if ( monthGap > 0 ) {
//    		checkDate = DateUtil.addMonth(fromValue, monthGap);
//        	int compare2 = toValue.compareTo(checkDate);
//        	if( compare2 > 0 ){
//        		throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_DATELIMIT, toKey+"["+monthGap+"M]");
//        	}
//    	}
//	}
//    
//    public void parameterFlagCheck(String key, String value, String[] checkValues) throws Exception {
//    	boolean checkFlag = false;
//    	for(int i=0; i<checkValues.length; i++) {
//    		if(value.equals(checkValues[i])) {
//    			checkFlag = true;
//    		}
//    	}
//    	
//		if(!checkFlag) {
//			throw new ParameterException(ExceptionMsg.INVALID_PARAMETER_GBN_FLAG , key);
//		}
//	}

//    public void parameterCheck(String key, String value) throws BizException {
//        if (!Pattern.matches(NUMBER_REGEX, value)) {
//            log.error("파라미터 항목의 값에 숫자 외의 문자열이 입력되었습니다. [항목명:" + key + "]");
//            throw new BizException("파라미터 항목의 값에 숫자 외의 문자열이 입력되었습니다. [항목명:" + key + "]");
//        }
//    }

//    public void parameterCheck(String key, String value, String checkValue) throws BizException {
//        if (value.equals("") || !value.toLowerCase().equals(checkValue)) {
//            log.error("파라미터 항목의 값이 NULL 또는 " + checkValue + "외의 값이 입력되었습니다.  [항목명:" + key + "]");
//            throw new BizException("파라미터 항목의 값이 NULL 또는 " + checkValue + "외의 값이 입력되었습니다.  [항목명:" + key + "]");
//        }
//    }
//
//    public void parameterCheck(String key, String value, int length) throws BizException {
//        if (value.equals("") || value.length() != length) {
//            log.error("파라미터 항목의 값이 NULL 또는 허용 자리 수 " + length + "자리가 아닌 값이 입력되었습니다.  [항목명:" + key + "]");
//            throw new BizException("파라미터 항목의 값이 NULL 또는 허용 자리 수 " + length + "자리가 아닌 값이 입력되었습니다.  [항목명:" + key + "]");
//        }
//    }
//
//    public void parameterCheck(String key, String value) throws BizException {
//        String checkDate = new DateUtil().addDate(value, 0);
//        if (!value.equals(checkDate)) {
//            log.error("파라미터 항목의 값이 유효한 일자가 아닌 값이 입력되었습니다.  [항목명:" + key + "]");
//            throw new BizException("파라미터 항목의 값이 유효한 일자가 아닌 값이 입력되었습니다.  [항목명:" + key + "]");
//        }
//    }
//
//    public void parameterCheck(String key, String value, int length) throws BizException {
//        if (value.equals("") || value.length() > length) {
//            log.error("파라미터 항목의 값이 NULL 또는 허용 자리 수 " + length + "자리를 초과한 값이 입력되었습니다.  [항목명:" + key + "]");
//            throw new BizException("파라미터 항목의 값이 NULL 또는 허용 자리 수 " + length + "자리를 초과한 값이 입력되었습니다.  [항목명:" + key + "]");
//        }
//    }
}
