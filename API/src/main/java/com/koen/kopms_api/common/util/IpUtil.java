package com.koen.kopms_api.common.util;

import jakarta.servlet.http.HttpServletRequest;

public class IpUtil {
	
	private IpUtil() {}

    public static String getClientIP(HttpServletRequest request) {
    	String ip = request.getHeader("X-Forwarded-For"); // 프록시 체인
        if (isValidIp(ip)) {
            ip = ip.split(",")[0].trim();
            return normalizeIp(ip);
        }

        ip = request.getHeader("X-Real-IP"); // Nginx 단일 프록시
        if (isValidIp(ip)) {
            return normalizeIp(ip);
        }

        ip = request.getRemoteAddr();
        return normalizeIp(ip);
    }
    
    // IPv6 → IPv4 정규화
    private static String normalizeIp(String ip) {
        if (ip == null) {
            return null;
        }

        // IPv6 loopback (::1)
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }

        return ip;
    }
    
    private static boolean isValidIp(String ip) {
        return ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip);
    }


}
