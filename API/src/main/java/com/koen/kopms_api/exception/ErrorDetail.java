package com.koen.kopms_api.exception;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Data;
import net.sf.jsqlparser.util.validation.ValidationError;		// SQL 문자열을 파싱(parse)

/*
 * 에러 응답을 표준
 */

@Data
public class ErrorDetail {

	private String title;
	private int status;
	private String detail;
	private long timeStamp;
	private String path;
	private String developerMessage;
	private Map<String, List<ValidationError>> errors = new HashMap<>();
	
}