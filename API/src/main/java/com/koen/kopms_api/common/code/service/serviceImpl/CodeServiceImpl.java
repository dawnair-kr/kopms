package com.koen.kopms_api.common.code.service.serviceImpl;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.koen.kopms_api.common.code.dao.CodeDao;
import com.koen.kopms_api.common.code.service.CodeService;
import com.koen.kopms_api.exception.ResourceNotFoundException;
import com.koen.kopms_api.model.vo.CodeGroupVO;
import com.koen.kopms_api.model.vo.CodeVO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodeServiceImpl implements CodeService {
	
	@Autowired
	private CodeDao codeDao;	// MyBatis Mapper 인터페이스

	@Override
	public List<CodeGroupVO> getCodeGroupV(String groupCode)  throws Exception {		
//		log.info("CodeServiceImpl - getCodeGroup for group: {}", groupCode);
		return codeDao.selectCodeGroupV(groupCode);
	}
	
	@Override
	public List<CodeVO> getCodeListV(String groupCode) throws Exception {		
//		log.info("CodeServiceImpl - getCodeList for group: {}", groupCode);	
		return codeDao.selectCodeListV(groupCode);
	}
	
	// Group Code : 단건
	@Override
	public HashMap<String, Object> getGroupCode(HashMap<String, Object> searchMap) throws Exception {
//		log.info("CodeServiceImpl - getGroupCode for searchMap: {}", searchMap);	
		
		HashMap<String, Object> groupCode = codeDao.selectGroupCode(searchMap);
		return groupCode;
	}
	
	// Group Code : 다건
	@Override
	public HashMap<String, Object> getGroupCodeList(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("CodeServiceImpl - getGroupCode for searchMap: {}", searchMap);	

		List<HashMap<String, Object>> groupList = codeDao.selectGroupCodeList(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("groupList", groupList);
		
		return resultMap;
	}
	
	// Code : 단건
	@Override
	public HashMap<String, Object> getCode(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("CodeServiceImpl - getCode for searchMap: {}", searchMap);	
		
		HashMap<String, Object> code = codeDao.selectCode(searchMap);
		
		if (code == null) {
			throw new ResourceNotFoundException("ResourceNotFound Test --- 정보가 존재하지 않습니다.");
	    }
		
		return code;
	}

	// Code : 다건
	@Override
	public HashMap<String, Object> getCodeList(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("CodeServiceImpl - getCodeList for searchMap: {}", searchMap);	
		
		List<HashMap<String, Object>> codeList = codeDao.selectCodeList(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("codeList", codeList);
		
		return resultMap;
		
	}
	
	// Code : 그룹별 코드
	@Override
	public HashMap<String, Object> getGroupCodes(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("CodeServiceImpl - getGroupCodes for searchMap: {}", searchMap);	
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		// 코드 리스트
		List<HashMap<String, Object>> searchCodeList = (List<HashMap<String, Object>>) searchMap.get("comCodes");
		for (int i = 0; i < searchCodeList.size(); i++) {
			HashMap<String, Object> searchCode = searchCodeList.get(i);
			//log.info("CodeServiceImpl - getGroupCodes for searchCode: {}", searchCode);
			
			List<HashMap<String, Object>> codeList = codeDao.selectCodeList(searchCode);
			resultMap.put((String) searchCode.get("codeName"), codeList);
		}
		
		return resultMap;
		
	}
	
	// Code : 페이징
	@Override
	public HashMap<String, Object> getCodePage(HashMap<String, Object> searchMap) throws Exception {
		
//		log.info("CodeServiceImpl - getCodePage for searchMap: {}", searchMap);	
		
		List<HashMap<String, Object>> codePage = codeDao.selectCodePage(searchMap);
		
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		resultMap.put("codePage", codePage);
		
		return resultMap;
	}
	

}
