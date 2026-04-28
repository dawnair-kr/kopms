package com.koen.kopms_api.common.code.service;

import java.util.HashMap;
import java.util.List;

import com.koen.kopms_api.model.vo.CodeGroupVO;
import com.koen.kopms_api.model.vo.CodeVO;

public interface CodeService {
	
	// VO
	public List<CodeGroupVO> getCodeGroupV(String groupCode) throws Exception;	
	public List<CodeVO> getCodeListV(String groupCode) throws Exception;
	
	// Group Code : 단건
	public HashMap<String, Object> getGroupCode(HashMap<String, Object> searchMap) throws Exception;
	
	// Group Code : 다건
	public HashMap<String, Object> getGroupCodeList(HashMap<String, Object> searchMap) throws Exception;
	
	// Code : 단건
	public HashMap<String, Object> getCode(HashMap<String, Object> searchMap) throws Exception;
	
	// Code : 다건
	public HashMap<String, Object> getCodeList(HashMap<String, Object> params) throws Exception;
	
	// Code : 그룹별 코드
	public HashMap<String, Object> getGroupCodes(HashMap<String, Object> params) throws Exception;
		
	// Code : 페이징
	public HashMap<String, Object> getCodePage(HashMap<String, Object> params) throws Exception;
	

}
