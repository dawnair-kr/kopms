package com.koen.kopms_api.common.file.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
	
	// upload
	public HashMap<String, Object> upload( HashMap<String, Object> searchMap, List<MultipartFile> files) throws Exception;
	
	// 파일 수정 [삭제]
	public int deleteFile(HashMap<String, Object> params) throws Exception;
	
	// 파일조회
	public HashMap<String, Object> getFile(HashMap<String, Object> params) throws Exception;

	// 기존 파일을 현재 attachFileSeq로 연결 (물리 복사 없이 DB 레코드만 추가)
	public HashMap<String, Object> linkFile(HashMap<String, Object> params) throws Exception;

}
