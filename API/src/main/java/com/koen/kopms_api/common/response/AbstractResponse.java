package com.koen.kopms_api.common.response;

import java.io.Serializable;

import lombok.Data;

/*
 * 모든 API 응답의 “공통 베이스(Response 부모 클래스)”
 */

@Data
public abstract class AbstractResponse implements Serializable {
	
	/**
	 * serial Version ID
	 */
	private static final long serialVersionUID = 3009042898923639347L;
	
	private int count;			// 현재 페이지의 데이터 건수
	private int code;			// 상태 코드 - 0: 성공, 음수/양수: 에러, HTTP status와는 별개, 프론트(Vue)에서 분기 처리용
	private String message;		// 사용자 또는 개발자 메시지, Vue
	private int pagePerCount;	// 한 페이지당 보여줄 데이터 수
	private int currentPage;	// 현재 페이지 번호
	private int totalCount;		// 전체 데이터 건수 (DB count)
	private int startPage;		// 페이지 네비게이션 범위
	private int endPage;		// 페이지 네비게이션 범위
	private int lastPage;		// 전체 페이지 수 : ceil(totalCount / pagePerCount)
}
