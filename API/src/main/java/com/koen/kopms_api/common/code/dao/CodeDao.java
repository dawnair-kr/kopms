package com.koen.kopms_api.common.code.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.koen.kopms_api.model.vo.CodeGroupVO;
import com.koen.kopms_api.model.vo.CodeVO;

@Mapper	// MyBatis Mapper 등록[DAO]
public interface CodeDao {
	
	// Get
	List<CodeGroupVO> selectCodeGroupV(String groupCode) throws Exception; 
	// Get 
	List<CodeVO> selectCodeListV(String groupCode) throws Exception;
	
	
//	@Select("""
//	        SELECT CODE_GROUP AS codeGroup, CODE_GROUP_NAME AS codeGroupName, USE_YN AS useYn
//			  FROM COME_CODE_GROUP
//             WHERE 1 = 1
//               AND CODE_GROUP = #{groupCode}
//	           AND USE_YN = 'Y'
//	    """)
//	    List<CodeGroupVO> selectCodeGroup(@Param("groupCode") String groupCode);
	
	// Group Code : 단건	
	HashMap<String, Object> selectGroupCode(HashMap<String, Object> searchMap) throws Exception;
	
	// Group Code : 다건
	List<HashMap<String, Object>> selectGroupCodeList(HashMap<String, Object> searchMap) throws Exception;
	
	// Code : 단건
	HashMap<String, Object> selectCode(HashMap<String, Object> searchMap) throws Exception;
	
	// Code : 다건
	List<HashMap<String, Object>> selectCodeList(HashMap<String, Object> searchMap) throws Exception;
	
	// Code : 페이징
	List<HashMap<String, Object>> selectCodePage(HashMap<String, Object> searchMap) throws Exception;
    
    
}
