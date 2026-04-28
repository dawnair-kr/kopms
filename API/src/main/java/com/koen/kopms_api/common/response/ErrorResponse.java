package com.koen.kopms_api.common.response;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class ErrorResponse extends AbstractResponse {
	
	/**
	 * serial Version ID
	 */
	private static final long serialVersionUID = -1326816008016865170L;
	
	public ErrorResponse(String message) {
		
//		log.info("############################");
//		log.info("ErrorResponse ---1 message ::: {}", message);
//		log.info("############################");
		
    	setCode(404);
    	setMessage(message);
	}
	
	public ErrorResponse(int code, String message) {
		
		
//		log.info("############################");
//		log.info("ErrorResponse ---2 code ::: {}", code);
//		log.info("ErrorResponse ---2 message ::: {}", message);
//		log.info("############################");
		
    	setCode(code);
    	setMessage(message);
	}
	
}