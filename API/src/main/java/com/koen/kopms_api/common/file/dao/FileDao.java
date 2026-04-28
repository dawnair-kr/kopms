package com.koen.kopms_api.common.file.dao;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper	
public interface FileDao {
	
	// ATTACH_SEQ.NEXTVAL
	long selectAttachSeq() throws Exception;
	
	// 파일 수정 : 삭제
	int deleteFile(HashMap<String, Object> searchMap) throws Exception;
	
	// 조회
	List<HashMap<String, Object>> selectFile(HashMap<String, Object> searchMap) throws Exception;	

	// 목록 조회 (MASTER_NO 기준)
	List<HashMap<String, Object>> selectFileList(HashMap<String, Object> searchMap) throws Exception;

	// 파일 저장 
	int insertFile(HashMap<String, Object> searchMap) throws Exception;
	

}
