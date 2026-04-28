package com.koen.kopms_api.exception;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.NoSuchFileException;
import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;
import java.time.Instant;
import java.util.NoSuchElementException;

import org.apache.commons.lang3.SerializationException;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mapping.MappingException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdvice;

import com.koen.kopms_api.common.response.AbstractResponse;
import com.koen.kopms_api.common.response.CommonResponse;
import com.koen.kopms_api.common.response.ErrorResponse;
import com.koen.kopms_api.common.util.MessageUtil;
import com.koen.kopms_api.config.i18n.ExceptionMsg;
import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;

/*
 * 예외처리 여기서......
 * @RestControllerAdvice : @ControllerAdvice + @ResponseBody - 예외 처리 후 객체를 반환하면 자동으로 JSON/XML 형태로 변환하여 클라이언트에게 응답
 */
@Log4j2
@RestControllerAdvice			
public class GlobalExceptionHandler implements RequestBodyAdvice {
	
	@Inject
	Provider <SessionContext> sessionProvider;
	
	@Autowired
	private MessageUtil messageUtil;
	
	@ExceptionHandler(BizException.class)
	public <T> AbstractResponse handleBizException(BizException exception, HttpServletRequest request) {

//		log.info("############################");
//		log.info("GlobalExceptionHandler --- AbstractResponse handleBizException ::: ");
//		
//		log.info("############################");
		
		String message = messageUtil.getMessage(exception.getCode());
		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
		errorDetail.setStatus(exception.getCode());
		errorDetail.setTitle("Business Service Error");
		errorDetail.setDetail(exception.getMessage());
//		errorDetail.setDetail(message);
		errorDetail.setDeveloperMessage(exception.getClass().getName());

		return new CommonResponse<ErrorDetail>(exception.getCode(), message, errorDetail);
		//return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetail);

	}
	
	@ExceptionHandler(SessionNotFoundException.class)
	public ResponseEntity<ErrorDetail> handleSessionNotFoundException(SessionNotFoundException exception, HttpServletRequest request) {

//		log.info("############################");
//		log.info("GlobalExceptionHandler --- handleSessionNotFoundException ::: ");
//		log.info("############################");
		
		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
		errorDetail.setStatus(HttpStatus.UNAUTHORIZED.value());			// / Vue에서 interceptor로 잡기 쉽게 401 코드를 반환
		errorDetail.setTitle("Session Not Found");
		errorDetail.setDetail(exception.getMessage());
		errorDetail.setDeveloperMessage(exception.getClass().getName());
		
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetail);
		
	}
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorDetail> handleResourceNotFoundException(ResourceNotFoundException exception, HttpServletRequest request) {

//		log.info("############################");
//		log.info("GlobalExceptionHandler --- handleResourceNotFoundException ::: ");
//		log.info("############################");
		
		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
		errorDetail.setStatus(HttpStatus.NOT_FOUND.value());
		errorDetail.setTitle("Resource Not Found");
		errorDetail.setDetail(exception.getMessage());
		errorDetail.setDeveloperMessage(exception.getClass().getName());
		
//		return new ResponseEntity<>(errorDetail, null, HttpStatus.NOT_FOUND);		
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDetail);

	}
	
	/**
	 **** Service에서 SQL에 예외가 발생했을 때
	 **/
	@ExceptionHandler({ SQLException.class, DataAccessException.class, SQLSyntaxErrorException.class, BadSqlGrammarException.class })
	public CommonResponse<ErrorDetail> handleSQLSyntaxErrorException(Exception exception, HttpServletRequest request) {
	
//		log.info("############################");
//		log.info("GlobalExceptionHandler --- handleSQLSyntaxErrorException ::: ");
//		log.info("############################");
		
//		exception.printStackTrace();					
//		ErrorDetail errorDetail = new ErrorDetail();
//		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
//		errorDetail.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
//		errorDetail.setTitle("Internal Server Error");
//		//errorDetail.setDetail(exception.getMessage());
//		errorDetail.setDetail("시스템 오류가 발생했습니다.");
//		//errorDetail.setDeveloperMessage(exception.getClass().getName());
//		errorDetail.setDeveloperMessage(null);	// 운영에서는 숨김
//		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetail);
		
		// 26.01.29
		exception.printStackTrace();					// 콘솔솔(STDOUT)에만 출력
		
//		String message = messageUtil.getMessage(exception.getCode());
		String message = messageUtil.getMessage( 999 );
		
		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
		errorDetail.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		errorDetail.setTitle("Internal Server Error");
		errorDetail.setDetail( exception.getMessage() );
		//errorDetail.setDetail( "시스템 오류가 발생했습니다.");
		errorDetail.setDeveloperMessage(exception.getClass().getName());
		
		return new CommonResponse<ErrorDetail>(HttpStatus.INTERNAL_SERVER_ERROR.value(), message, errorDetail);		
	
	}
	
	@ExceptionHandler({ NoHandlerFoundException.class })
	public ResponseEntity<ErrorDetail> handleNoHandlerFoundException(Exception exception, HttpServletRequest request) {

//		log.info("############################");
//		log.info("GlobalExceptionHandler --- handleNoHandlerFoundException ::: ");
//		log.info("############################");
		
		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
		errorDetail.setStatus(HttpStatus.NOT_FOUND.value());
		errorDetail.setTitle("NoHandlerFoundException");
		errorDetail.setDetail(exception.getMessage());
		errorDetail.setDeveloperMessage(exception.getClass().getName());
		
		//return new ResponseEntity<>(errorDetail, null, HttpStatus.NOT_FOUND);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDetail);
	}
	
	@ExceptionHandler({ ClassCastException.class, SerializationException.class, NullPointerException.class, MappingException.class, NoSuchElementException.class, NoSuchBeanDefinitionException.class, Exception.class })
	public ResponseEntity<ErrorDetail> handleException(Exception exception, HttpServletRequest request) {
		
//		log.info("############################");
//		log.info("GlobalExceptionHandler --- handleException ::: ");
//		log.info("############################");
		
		exception.printStackTrace();

		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
		errorDetail.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		errorDetail.setTitle("INTERNAL_SERVER_ERROR");
		errorDetail.setDetail(exception.getMessage());
		errorDetail.setDeveloperMessage(exception.getClass().getName());
		
		//return new ResponseEntity<>(errorDetail, null, HttpStatus.INTERNAL_SERVER_ERROR);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetail);
	}
	
	@ExceptionHandler({ NoSuchFileException.class })
	public <T> AbstractResponse handleNoSuchFileException(Exception exception, HttpServletRequest request) {

//		log.info("############################");
//		log.info("GlobalExceptionHandler --- handleNoSuchFileException ::: ");
//		log.info("############################");
		
		String message = messageUtil.getMessage(ExceptionMsg.ERR_FILE_NOT_FOUND);
		ErrorDetail errorDetail = new ErrorDetail();
		errorDetail.setTimeStamp(Instant.now().getEpochSecond());
//		errorDetail.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		errorDetail.setStatus(-902);
		errorDetail.setTitle("Business Service Error");
		errorDetail.setDetail(message);
		errorDetail.setDeveloperMessage(exception.getClass().getName());
//		return new ResponseEntity<>(errorDetail, null, HttpStatus.OK);

		return new CommonResponse<ErrorDetail>(-902, message, errorDetail);
//		return new CommonResponse<ErrorDetail>(exception.getCode(), exception.getMessage(), errorDetail);
	}
	
	/*
	 * ????????
	 */
	@Override
	public boolean supports(MethodParameter methodParameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
		// TODO Auto-generated method stub
		return true;
	}
	
	@Override
	public HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) throws IOException {
		// TODO Auto-generated method stub
		return inputMessage;
	}
	
	@Override
	public Object afterBodyRead(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
		// TODO Auto-generated method stub

//		log.info("In afterBodyRead() targetType {} ::: {}", targetType.toString(), body.toString());
//
//		try {
//			this.userLog.put("svcParam", body.toString());
//			logDao.insertUserLog(this.userLog);
//		} catch (Exception e) {
//			// TODO Auto-generated catch block
//			log.warn("Service 접근 이력 적재 오류 :: {}", e.getMessage());
//		}

		return body;
	}

	@Override
	public Object handleEmptyBody(Object body, HttpInputMessage inputMessage, MethodParameter parameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
		// TODO Auto-generated method stub
		return body;
	}

}
