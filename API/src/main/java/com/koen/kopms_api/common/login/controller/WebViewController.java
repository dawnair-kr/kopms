package com.koen.kopms_api.common.login.controller;

import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebViewController implements ErrorController {

	@GetMapping({ "/", "/{path:[^\\.]*}", "/**/{path:[^\\.]*}" })
	public String redirect() {
		// 모든 경로를 Vue의 index.html로 포워딩
		return "forward:/index.html";
	}
}
