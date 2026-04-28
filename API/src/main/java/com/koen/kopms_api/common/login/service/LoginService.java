package com.koen.kopms_api.common.login.service;

import java.util.HashMap;

import jakarta.servlet.http.HttpServletRequest;

public interface LoginService {
	
	// ssoLogin
	public HashMap<String, Object> ssoLogin(HttpServletRequest request, HashMap<String, Object> searchMap) throws Exception;
	
	// Menus
	public HashMap<String, Object> getMenus(HashMap<String, Object> params) throws Exception;
	// getWemb
	public HashMap<String, Object> getWemb(HashMap<String, Object> params) throws Exception;	
	
	// LoginHistory
	public HashMap<String, Object> getLoginHistory(HashMap<String, Object> params) throws Exception;	
	
	// setLogMenu
	int setLogMenu(HashMap<String, Object> params) throws Exception;
	
	// insertMenu
	int insertMenu(HashMap<String, Object> params) throws Exception;
	
	// MenuList
	public HashMap<String, Object> getMenuList(HashMap<String, Object> searchMap) throws Exception;
	
}
