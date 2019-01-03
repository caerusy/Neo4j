package com.test.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.test.data.service.IllegalInfoService;
import com.test.data.service.RewardPunishmentService;

@Controller
@RequestMapping("/reward")
public class RewardPunishmentController {
	@Autowired
	private RewardPunishmentService rewardPunishmentService;
	
	@RequestMapping("/index")
	public String index(ModelMap model) throws Exception{
		return "reward/index";
	}
	
	@RequestMapping(value = "/rewardGraph/{rybh}/{index}/{total}")
	@ResponseBody
	public Map<String, Object> rewardGraph(ModelMap model, @PathVariable String rybh,@PathVariable int index,@PathVariable int total){
		if (!rybh.equals("null")) {
			rybh = ".*"+rybh+".*";
			
		}else {
			rybh=".*.*";
		}
		return rewardPunishmentService.rewardPunishmentsGraph(rybh,index,total);
	}
}
