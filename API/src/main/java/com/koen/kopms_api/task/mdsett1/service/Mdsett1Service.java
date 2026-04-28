package com.koen.kopms_api.task.mdsett1.service;

import java.util.HashMap;

public interface Mdsett1Service {	
	
	// 권한 신청 리스트 페이징
	public HashMap<String, Object> getMdsett1ListP(HashMap<String, Object> params) throws Exception;	
}
