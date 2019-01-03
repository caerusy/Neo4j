package com.test.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.test.data.service.IllegalInfoService;
import com.test.data.service.TrainService;

@Controller
@RequestMapping("/train")
public class TrainController {
	@Autowired
	private TrainService trainService;
	
	@RequestMapping("/index")
	public String index(ModelMap model) throws Exception{
		return "train/index";
	}
	
	@RequestMapping(value = "/trainGraph/{rybh}/{index}/{total}")
	@ResponseBody
	public Map<String, Object> trainGraph(ModelMap model, @PathVariable String rybh,@PathVariable int index,@PathVariable int total){
		if (!rybh.equals("null")) {
			rybh = ".*"+rybh+".*";
			
		}else {
			rybh=".*.*";
		}
		return trainService.trainGraph(rybh,index,total);
	}
}

