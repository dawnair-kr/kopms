package com.koen.kopms_api.common.util;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import com.koen.kopms_api.model.vo.SessionContext;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
public class MessageUtil {

	/**
	 * 다국어 메세지를 가져오기 위한 MessageSource
	 */
	@Autowired
	MessageSource messageSource;

	@Inject
	Provider<SessionContext> sessionProvider;
	
	public String getMessage(String messageKey, String[] values) {
		
		SessionContext sessionContext = sessionProvider.get();
		Locale locale = sessionContext.getLocale();
//		log.info("############################");
//		log.info("locale ::: {}", locale);
//		log.info("############################");
		String message = messageSource.getMessage(messageKey, values, "default text", locale);
		return message;
	}

	public String getMessage(String messageKey) {
		String message = getMessage(messageKey, null);
		return message;
	}
	
	public String getMessage(int messageKey, String[] values) {		

		SessionContext sessionContext = sessionProvider.get();
		Locale locale = sessionContext.getLocale();
//		log.info("############################");
//		log.info("locale ::: {}", locale);
//		log.info("############################");

		String message = messageSource.getMessage(String.valueOf(messageKey), values, "default text", locale);
		return message;
	}

	public String getMessage(int messageKey) {
		
//		log.info("############################");
//		log.info("getMessage ::: {}", messageKey);
//		log.info("############################");
		
		String message = getMessage(String.valueOf(messageKey), null);
		return message;
	}
}