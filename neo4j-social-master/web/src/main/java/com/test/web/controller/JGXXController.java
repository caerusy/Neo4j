package com.test.web.controller;



import com.test.data.service.JGXXService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

import java.io.InputStream;
import java.util.Date;
import java.util.Map;


@Controller
@RequestMapping("/jgxx")
public class JGXXController {
   // private static Logger logger = LoggerFactory.getLogger(ShowController.class);

    @Autowired
    private JGXXService jgxxService;


    @RequestMapping("/index")
    public String index(ModelMap model) throws Exception{
        return "jgxx/index";
    }

    

    
    @RequestMapping(value = "/jgxxControllerGraph/{jgmc}")                               //根据机构名称搜索
    @ResponseBody
   	public Map<String, Object> jgxxControllerGraph(ModelMap model,@PathVariable String jgmc) {
    	if(!jgmc.equals("null")){
    		jgmc=".*"+jgmc+".*";//图的模糊查询
    		return jgxxService.jgxxControllerGraphByJGMC(jgmc);
    	}else{
    		return jgxxService.jgxxControllerGraph();
    	}
    	
   		
   	}
    

    @RequestMapping(value = "/jgxxGraph/{jgbm}/{index}/{total}")                          //呈现下级机构
    @ResponseBody
   	public Map<String, Object> jgxxGraph(ModelMap model,@PathVariable String jgbm,@PathVariable int index,@PathVariable int total) {
    	if(!jgbm.equals("null")){
    		jgbm=".*"+jgbm+".*";//图的模糊查询
    		
    	}else{
    		jgbm=".*.*";//图的模糊查询
    	}
    	return jgxxService.jgxxGraph(jgbm,index,total);
   	}

   

}
