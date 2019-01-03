package com.test.web.controller;


import com.test.data.repository.OfficerRepository;
import com.test.data.service.JGXXService;
import com.test.data.service.OfficerService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.remoting.RemoteTimeoutException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

import java.util.Date;
import java.util.Map;


@Controller
@RequestMapping("/officer")
public class OfficerController {

    @Autowired
    private OfficerService officerService;


    @RequestMapping("/index")
    public String index(ModelMap model) throws Exception{
        return "officer/index";
    }


    

    
    @RequestMapping(value = "/officerControllerGraph/{name}")
    @ResponseBody
   	public Map<String, Object> officerControllerGraph(ModelMap model,@PathVariable String name) {
    	if(!name.equals("null")){
    		name=".*"+name+".*";//图的模糊查询
    		return officerService.officerControllerGraphByName(name);
    	}else{
    		return officerService.officerControllerGraph();
    	}
    	
   		
   	}
    
    @RequestMapping(value = "/officerGraphByJGBM/{jgbm}/{index}/{total}")
    @ResponseBody
    public Map<String,Object> jgxxGraphByJGBM(ModelMap model,@PathVariable String jgbm,@PathVariable int index,@PathVariable int total){
    	if(!jgbm.equals("null")) {
    		jgbm = ".*" + jgbm +".*";
    	}
    	else {
    		jgbm = ".*.*";
    	}
    	return officerService.JgGraphByJGBM(jgbm,index,total);
    }
    
    @RequestMapping(value = "/officerGraph/{jgbm}/{index}/{total}")
    @ResponseBody
    public Map<String,Object> officerGraph(ModelMap model,@PathVariable String jgbm,@PathVariable int index,@PathVariable int total){
    	if(!jgbm.equals("null")) {
    		jgbm = ".*" + jgbm +".*";
    	}
    	else {
    		jgbm = ".*.*";
    	}
    	return officerService.officerGraphByJGBM(jgbm,index,total);
    }
   }