package com.koen.kopms_api.config;

import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.koen.kopms_api.common.listener.SessionListener;

import jakarta.servlet.http.HttpSessionListener;

@Configuration
public class ListenerConfig {

    @Bean
    public ServletListenerRegistrationBean<HttpSessionListener> sessionListenerRegistration(
                SessionListener listener) {
        return new ServletListenerRegistrationBean<>(listener);
    }
}