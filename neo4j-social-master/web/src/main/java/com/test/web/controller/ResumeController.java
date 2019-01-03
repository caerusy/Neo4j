package com.test.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.test.data.service.IllegalInfoService;
import com.test.data.service.ResumeService;

@Controller
@RequestMapping("/resume")
public class ResumeController {
	@Autowired
	private ResumeService resumeService;
	
	@RequestMapping("/index")
	public String index(ModelMap model) throws Exception{
		return "resume/index";
	}
	
	@RequestMapping(value = "/resumeGraph/{rybh}/{index}/{total}")
	@ResponseBody
	public Map<String, Object> resumeGraph(ModelMap model, @PathVariable String rybh,@PathVariable int index,@PathVariable int total){
		if (!rybh.equals("null")) {
			rybh = ".*"+rybh+".*";
			
		}else {
			rybh=".*.*";
		}
		return resumeService.resumeGraph(rybh,index,total);
	}
}

