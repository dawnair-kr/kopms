package com.koen.kopms_api.common.response;

import java.util.List;

import lombok.Data;

@Data
public class PagingResponse<T> extends AbstractResponse {
	
	/**
	 * serial Version ID
	 */
	private static final long serialVersionUID = -8628441556882878826L;

	private T data;
	private String encReqDataMap;
	
    /*
     * 페이징 처리에 필요한 Response
     * @Response Code
     * @Response Message
     * @Response Data
     * @Page 당 건수(Request Data)
     * @출력 Page(Request Data)
     * @전체 건수
     */
    public PagingResponse(int code, String message, T data, int pagePerCount, int currentPage, int totalCount, int startPage, int endPage, int lastPage) {
    	
    	setCode(code);
    	setMessage(message);
    	setPagePerCount(pagePerCount);
    	setCurrentPage(currentPage);
    	setTotalCount(totalCount);
    	setStartPage(startPage);
    	setEndPage(endPage);
    	setLastPage(lastPage);
    	
		this.data = data;
		
		if(data instanceof List) {
			setCount(((List<?>)data).size());
		} else {
			setCount(1);
		}
    }
	
    /*
     * 페이징 처리에 필요한 Response + 개발환경일 경우 Request Data를 맵으로 바까서 Response로 보내 줌
     * @Response Code
     * @Response Message
     * @Response Data
     * @Page 당 건수(Request Data)
     * @출력 Page(Request Data)
     * @전체 건수
     */
    public PagingResponse(int code, String message, T data, int pagePerCount, int currentPage, int totalCount, int startPage, int endPage, int lastPage, String encReqDataMap) {
    	
    	setCode(code);
    	setMessage(message);
    	setPagePerCount(pagePerCount);
    	setCurrentPage(currentPage);
    	setTotalCount(totalCount);
    	setStartPage(startPage);
    	setEndPage(endPage);
    	setLastPage(lastPage);
    	
    	this.encReqDataMap = encReqDataMap;
		this.data = data;
		
		if(data instanceof List) {
			setCount(((List<?>)data).size());
		} else {
			setCount(1);
		}
    }
}
