package com.test.web.controller;

import com.test.data.repository.CriminalRepository;
import com.test.data.service.JGXXService;
import com.test.data.service.CriminalService;
import com.test.data.service.FamilyService;

import org.neo4j.cypher.internal.compiler.v2_2.ast.rewriters.nameAllPatternElements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.remoting.RemoteTimeoutException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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
@RequestMapping("/family")
public class FamilyController {
	@Autowired
	private FamilyService familyService;
	
	@RequestMapping("/index")
	public String index(ModelMap model) throws Exception{
		return "family/index";
	}
	
	@RequestMapping(value = "/familyGraph/{rybh}/{index}/{total}")
	@ResponseBody
	public Map<String, Object> familyGraph(ModelMap model, @PathVariable String rybh,@PathVariable int index,@PathVariable int total){
		if (!rybh.equals("null")) {
			rybh = ".*"+rybh+".*";
			
		}else {
			rybh=".*.*";
		}
		return familyService.familyGraph(rybh,index,total);
	}
}
