package com.koen.kopms_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.extern.log4j.Log4j2;

/*
 * 
 */

@Log4j2
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
	
	public ResourceNotFoundException() {}
	
	public ResourceNotFoundException(String message) {
		super(message);
//		log.info("############################");
//		log.info("ResourceNotFoundException --- message ::: {}", message);
//		log.info("############################");
	}
	
	public ResourceNotFoundException(String message, Throwable cause) {
		super(message,cause);
	}

}