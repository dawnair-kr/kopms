package com.koen.kopms_api.exception;

import lombok.extern.log4j.Log4j2;

/*
 * 
 */
@Log4j2
public class ServiceException extends RuntimeException {

	private static final long serialVersionUID = -9005806218564812749L;

	private int errorCode = -1;

	/**
	 * Constructior
	 */
	public ServiceException() {

	}

	/**
	 * Constructior
	 * @param message 오류메세지
	 */
	public ServiceException(String message) {

		super(message);
//		log.info("############################");
//		log.info("ServiceException --- message ::: {}", message);
//		log.info("############################");
	}

	/**
	 * Constructior
	 * @param throwable 오류원인
	 */

	public ServiceException(Throwable throwable) {

		super(throwable);
	}

	/**
	 * Constructior
	 * @param message 오류메세지
	 * @param throwable 오류원인
	 */
	public ServiceException(String message, Throwable throwable) {

		super(message, throwable);
	}

	/**
	 * Constructior
	 * @param errorCode 오류코드
	 * @param message 오류메세지
	 * @param throwable 오류원인
	 */
	public ServiceException(int errorCode, String message, Throwable throwable) {

		super(message, throwable);
		setErrorCode(errorCode);
	}

	/**
	 * Constructior
	 * @param errorCode 오류코드
	 * @param message 오류메세지
	 */
	public ServiceException(int errorCode, String message) {

		this(errorCode, message, null);
	}

	/**
	 * 오류코드 설정
	 * @param errorCode 오류코드
	 */
	public void setErrorCode(int errorCode) {

		this.errorCode = errorCode;
	}

	/**
	 * 오류코드반환
	 * @return 오류코드
	 */
	public int getErrorCode() {

		return this.errorCode;
	}

	public String toString() {

		StringBuilder buf = new StringBuilder();
		buf.append("ServiceException (ErrorCode = ").append(this.errorCode).append(")");

		String message = getLocalizedMessage();

		if (message != null) {
			buf.append(" : ").append(message);
		}

		return buf.toString();
	}

	public String getDetailMessage() {

		Throwable throwable = getCause();
		if (throwable != null) {
			return throwable.getLocalizedMessage();
		}

		return getMessage();
	}
}
