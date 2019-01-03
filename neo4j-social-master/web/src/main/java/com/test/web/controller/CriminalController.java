package com.test.web.controller;


import com.test.data.repository.CriminalRepository;
import com.test.data.service.JGXXService;
import com.test.data.service.CriminalService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.remoting.RemoteTimeoutException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

import java.util.Date;
import java.util.Map;


@Controller
@RequestMapping("/criminal")
public class CriminalController {

    @Autowired
    private CriminalService criminalService;


    @RequestMapping("/index")
    public String index(ModelMap model) throws Exception{
        return "criminal/index";
    }


    

    
    @RequestMapping(value = "/criminalControllerGraph/{name}")
    @ResponseBody
   	public Map<String, Object> criminalControllerGraph(ModelMap model,@PathVariable String name) {
    	if(!name.equals("null")){
    		name=".*"+name+".*";//图的模糊查询
    		return criminalService.criminalControllerGraphByName(name);
    	}else{
    		return criminalService.criminalControllerGraph();
    	}
    	
   		
   	}
    
    @RequestMapping(value = "/criminalGraph/{jgbm}/{rybh}/{index}/{total}")
    @ResponseBody
    public Map<String,Object> jgxxGraphByJGBM(ModelMap model,@PathVariable String jgbm,@PathVariable String rybh,@PathVariable int index,@PathVariable int total){
    	if(!jgbm.equals("null")) {
    		jgbm = ".*" + jgbm +".*";
    	}
    	else {
    		jgbm = ".*.*";
    	}
    	return criminalService.JgGraphByJGBM(jgbm,rybh,index,total);
    }
}
    
    /*@RequestMapping(value = "/criminalInfo/{index}/{total}")
    @ResponseBody
    public Map<String, Object> criminalInfoGraph(ModelMap model, @PathVariable int index, @PathVariable int total){
    	return criminalService.criminalInfoGraph(index, total);
    }
 }*/

 