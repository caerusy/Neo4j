package com.test.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.test.data.service.IllegalInfoService;
import com.test.data.service.LeaveService;

@Controller
@RequestMapping("/leave")
public class LeaveController {
	@Autowired
	private LeaveService leaveService;
	
	@RequestMapping("/index")
	public String index(ModelMap model) throws Exception{
		return "leave/index";
	}
	
	@RequestMapping(value = "/leaveGraph/{rybh}/{index}/{total}")
	@ResponseBody
	public Map<String, Object> leaveGraph(ModelMap model, @PathVariable String rybh,@PathVariable int index,@PathVariable int total){
		if (!rybh.equals("null")) {
			rybh = ".*"+rybh+".*";
			
		}else {
			rybh=".*.*";
		}
		return leaveService.leaveGraph(rybh,index,total);
	}
}

