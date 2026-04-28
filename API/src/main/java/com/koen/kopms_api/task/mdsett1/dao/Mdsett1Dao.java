package com.koen.kopms_api.task.mdsett1.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;



@Mapper	
public interface Mdsett1Dao {
	
	// 권한신청 히스트 페이징 
	List<HashMap<String, Object>> selectMdsett1ListP(HashMap<String, Object> searchMap) throws Exception;
	
	// 권한신청 여부 체크 : 평가위원(내부 외부)
	int countByWstSbn(String wstSbn) throws Exception;
	
	// 권한신청 저장 : 평가위원(내부 외부)
	int insertMdsett1(HashMap<String, Object> employInfo) throws Exception;
    
	

}
