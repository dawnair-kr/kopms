package com.koen.kopms_api.exception;

// ??????
public class SessionNotFoundException extends ServiceException {

	/**
	*
	*/

	private static final long serialVersionUID = -248079685868718529L;

	/**
	* Constructior
	*/
	public SessionNotFoundException() {
	}

	/**
	* Constructior
	* @param message 오류메세지
	*/
	
	public SessionNotFoundException(String message) {

		super(message);
	}
	
	/**
	* Constructior
	* @param throwable 오류원인
	*/
	
	public SessionNotFoundException(Throwable throwable) {
		
		super(throwable);	
	}
	
	/**
	* Constructior
	* @param message 오류메세지
	* @param throwable 오류원인
	*/
	public SessionNotFoundException(String message, Throwable throwable) {
	
		super(message, throwable);
	}
	
	public SessionNotFoundException(int errorCode, String message) {
	
		super(errorCode, message);
	}
}
