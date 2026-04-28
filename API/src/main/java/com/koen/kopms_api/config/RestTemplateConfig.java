package com.koen.kopms_api.config;

import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.TimeValue;
import org.apache.hc.core5.util.Timeout;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/*
 * HTTP 통신 클라이언트 : 외부 SSO 서버와 통신 - SSO 유효성 체크
 */

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {

        // 1.Connect Timeout : 서버 연결 시도 시간
        ConnectionConfig connectionConfig = ConnectionConfig.custom()
                .setConnectTimeout(Timeout.ofSeconds(2))
                .build();

        // 2. Connection Pool : 
        PoolingHttpClientConnectionManager connManager =
                new PoolingHttpClientConnectionManager();

        connManager.setMaxTotal(100);
        connManager.setDefaultMaxPerRoute(20);
        connManager.setDefaultConnectionConfig(connectionConfig);

        // 3. Request Timeout : Response / Pool 대기 Timeout 설정
        RequestConfig requestConfig = RequestConfig.custom()
                .setResponseTimeout(Timeout.ofSeconds(2))
                .setConnectionRequestTimeout(Timeout.ofSeconds(2))
                .build();

        // 4. HttpClient 생성
        // Keep-Alive 설정
        // Idle Connection 제거, 30초 이상 사용되지 않은 연결 제거
        CloseableHttpClient httpClient =
                HttpClients.custom()
                        .setConnectionManager(connManager)
                        .setDefaultRequestConfig(requestConfig)
                        .setKeepAliveStrategy((response, context) ->
                        TimeValue.ofSeconds(30))
		                .evictIdleConnections(TimeValue.ofSeconds(30))
		                .build();
                        

        // 5.RestTemplate 적용
        HttpComponentsClientHttpRequestFactory factory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        return new RestTemplate(factory);
    }
}
