package com.test.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.test.data.service.IllegalInfoService;

@Controller
@RequestMapping("/illegal")
public class IllegalInfoController {
	@Autowired
	private IllegalInfoService illegalInfoService;
	
	@RequestMapping("/index")
	public String index(ModelMap model) throws Exception{
		return "illegal/index";
	}
	
	@RequestMapping(value = "/illegalGraph/{rybh}/{index}/{total}")
	@ResponseBody
	public Map<String, Object> illegalGraph(ModelMap model, @PathVariable String rybh,@PathVariable int index,@PathVariable int total){
		if (!rybh.equals("null")) {
			rybh = ".*"+rybh+".*";
			
		}else {
			rybh=".*.*";
		}
		return illegalInfoService.illegalGraph(rybh,index,total);
	}
}
