package com.koen.kopms_api.common.response;

import java.util.List;

import lombok.Data;
import lombok.extern.log4j.Log4j2;

/*
 * AbstractResponse를 실제 API 응답으로 완성시키는 “표준 래퍼(Response Wrapper)” 역할
 */
@Log4j2
@Data
public class CommonResponse<T> extends AbstractResponse {
	
	/**
	 * serial Version ID
	 */
	private static final long serialVersionUID = 1L;

	private T data;
	
	/*
	 * 성공 응답 기본형
	 */
	public CommonResponse(T data) {
//		log.info("############################");
//		log.info("CommonResponse ---1 data ::: {}", data);
//		log.info("############################");
		
		this.data = data;
		if(data instanceof List) {
			setCount(((List<?>)data).size());
		} else {
			setCount(1);
		}
	}
	
	/*
	 * 상태 코드만 제어하고 싶을 때
	 * 내부 처리 결과에 따라 코드만 다르게 내려줄 때
	 */
    public CommonResponse(int code,T data) {
//    	log.info("############################");
//		log.info("CommonResponse ---2 code ::: {}", code);
//		log.info("############################");
		
    	setCode(code);
		this.data = data;
		if(data instanceof List) {
			setCount(((List<?>)data).size());
		} else {
			setCount(1);
		}
    }
	
    /*
     * 에러 / 성공 메시지까지 명시
     * 프론트(Vue)에 바로 표시할 메시지 전달
     */
    public CommonResponse(int code, String message, T data) {
    	
    	log.info("############################");
		log.info("CommonResponse ---3 code ::: {}", code);
		log.info("CommonResponse ---3 message ::: {}", message);
		log.info("CommonResponse ---3 data ::: {}", data);
		log.info("############################");
		
    	setCode(code);
    	setMessage(message);
		this.data = data;
		if(data instanceof List) {
			setCount(((List<?>)data).size());
		} else {
			setCount(1);
		}
    }
}

