package com.koen.kopms_api.exception;

import com.koen.kopms_api.config.i18n.ExceptionMsg;

import lombok.extern.log4j.Log4j2;

/**
 * 장애코드를 관리하는 예외
 */
@Log4j2
public class BizException extends Exception{

	private static final long serialVersionUID = -2132489393343631425L;
	private int code;
	private String msg = "";
	private String key = "";
	private String reason = "";
	
	public BizException() {
	}
	
	public BizException(int code) {
		this.code = code;
	}
	
	public BizException(String msg) {
		
//		log.info("############################");
//		log.info("BizException --- msg ::: {}", msg);
//		log.info("############################");
		
		this.msg = msg;
	}

	public BizException(int code, String msg) {
		this.code = code;
		this.msg = msg;
	}

	public BizException(int code, String key, String reason) {
		this.code = code;
		this.key = key;
		this.reason = reason;
	}
	
	@Override
	public String getMessage() {
		
//		return this.msg;
		if (!"".equals(this.msg)) {
			return this.msg;
		} else {
			return ExceptionMsg.getUserMessage(this.code);
		}
	}
	
	public String getCodeText() {
		
		return this.msg;
//		return ExceptionMsg.getUserMessage(this.code);
	}

	public int getCode() {
		return this.code;
	}

	public String getKey() {
		return this.key;
	}

	public String getReason() {
		return this.reason;
	}
}
