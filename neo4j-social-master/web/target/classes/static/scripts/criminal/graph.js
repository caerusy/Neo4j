var chaxuntext;
var width = 800, height = 800;
var force = d3.layout.force()//layout将json格式转化为力学图可用的格式
              .size([width, height])//大小
              .linkDistance(100)//连接线长度
              .charge(-1500);//值为+，则相互吸引，绝对值越大吸引力越大。值为-，则相互排斥，绝对值越大排斥力越大
var nodes=[];//保存节点信息
var links=[];//保存关系信息

var edges_line;//定义关系连线
var edges_text;//定义关系上显示的名称
var circle;//定义节点
var text;//定义节点上显示的文字
var svg;//定义力导向图，由于svg用到document中的svg元素，加载js时document还没初始化完毕，所以不能在js中调用document的svg元素，svg的初始化放到了showGraph函数中

function showGraph(queryName){
	$("svg").empty();//清除画布上的内容，每次查询前先清除上次查询的结果
	nodes=[];
	links=[];//清除画布上的内容，每次查询前先清除上次查询的结果
	chaxuntext=queryName;
	var zoom = d3.behavior.zoom()//缩放配置，
	             .scaleExtent([0, 2])//缩放比例
	             .on("zoom", function(){
		             svg.selectAll("g").attr("transform",//svg下的g标签移动大小
				     "translate("  +d3.event.translate + ")scale(" +d3.event.scale + ")");
	});

	svg = d3.select("svg")
	        .attr("width", width)
	        .attr("height", height)
	        .attr("pointer-events", "all")
	        .call(zoom); 
    //箭头
	var marker= svg.append("marker")//注意SVG规范中明确指出，附加到一个'Marker'元素上的“事件属性和事件的listener”不会被处理，//添加一个marker标签来绘制箭头
		           .attr("id", "resolved")//箭头id，用于其他标记进行引用时的url
		           .attr("markerUnits","userSpaceOnUse")//定义标记的坐标系统，userSpaceOnUse表示按照引用的元件来决定，strokeWidth按照用户单位决定
		           .attr("viewBox", "0 -5 10 10")//坐标系的区域
		           .attr("refX",35)//箭头坐标
		           .attr("refY", 0)
		           .attr("markerWidth", 12)//标识的大小
		           .attr("markerHeight", 12)
		           .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
		           .attr("stroke-width",3)//箭头宽度
		           .append("path")
		           .attr("d", "M0,-5L10,0L0,5")//绘制箭头，路径为一个三角形，有疑问参考svg的path http://www.runoob.com/svg/svg-path.html
		           .attr('fill','#000000');//箭头颜色
	if(!queryName){
		queryName="null";
	}
	$.get('../criminal/criminalControllerGraph/'+queryName,{ts:new Date().getTime()}, function(graph) {
		if(graph && graph.nodes){
			for(var index in graph.nodes){
				nodes.push(graph.nodes[index]);
			}
		}
		
		if(graph && graph.links){
			for(var index in graph.links){
				links.push(graph.links[index]);
			}
			
		}
		force.nodes(nodes).links(links);
		edges_line = svg.append("g").selectAll(".edgepath");
		edges_text = svg.append("g").selectAll(".edgelabel");
		circle = svg.append("g").selectAll("circle")
		text = svg.append("g").selectAll("text");
		update();//显示力导向图
	}); 
}


function update(){
	force.start();
	var tooltip = d3.select("body")
                    .append("div")//添加div并设置成透明
                    .attr("class","tooltip")
                    .style("opacity",0.0);
	edges_line = edges_line.data(links);//连线数据
	edges_line.enter()//当数组中的个数大于元素个数时，由d3创建空元素并与数组中超出的部分进行绑定。enter()只对对新添加的数据生成元素，已经有的数据不会再重新生成元素
	          .insert("path")//添加path标签
	          .attr({
		           'd': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},//变量 d 是由D3.js提供的一个在匿名函数中的可用变量。这个变量是对当前要处理的元素的_data_属性的引用。
		           'class':'edgepath',//定义该path标签class为edgepath
		           'id':function(d,i) {return 'edgepath'+i;}})// i也是d3.js提供的变量，表示当前处理的HTML元素在已选元素选集中的索引值
		      .style("stroke","#A254A2")//设置线条颜色
		      .style("stroke-width",1)//线条粗细
	          .attr("marker-end", "url(#resolved)" );//根据箭头标记的id号引用箭头
	edges_line.exit().remove();//exit()删除多余的元素
    //连线上的文字
	edges_text = edges_text.data(links);
	edges_text.enter()
	          .insert("text")//添加text标签
	          .attr({'class':'edgelabel',//定义该text标签class为edgelabel
		             'id':function(d,i){return 'edgepath'+i;},
		             'dx':70,//在连线上的坐标
		             'dy':15
	             })
	          .insert('textPath') //设置线条上的文字路径
	          .attr('xlink:href',function(d,i) {return '#edgepath'+i})
	              .style("pointer-events", "none")
	              .text(function(d){return d.relation;}); 
	edges_text.exit().remove();
    //圆圈
	circle = circle.data(nodes);//表示使用force.nodes数据
	circle.enter()
	      .insert("circle")
	      .style("fill",function(node){
		       var color;//圆圈背景色
		       var link=links[node.index];
		    /*   if(link!=undefined){
			      if(link.source.title==node.title && node.title==chaxuntext){
			          color="#2172B7";
			      }else{*/
			          if(node.label=="jg"){
			          	 color="#2172B7";
			          }else if(node.label=="criminal"){
			        	  color="#48F1EB";
			          }else if(node.label=="infomation"){
			        	 color="#7FBEF9";
			          }
			          else if(node.label == "family"){
			        	  color = "#E95335"
			          }
			          else if(node.label == "resume"){
			        	  color = "#36BF36"
			          }
			          else if(node.label == "reward") {
			        	  color = "#C940C9"
			          }
			          else if(node.label == "illegal"){
			        	  color = "#5C50E6"
			          }
			          else if(node.label == "train"){
			        	  color = "#B87333"
			          }
			          else if(node.label == "leave"){
			        	  color ="#ffff00"
			          }
			          else if(node.label == "familymember"){
			        	  color ="#bc8f8f"
			          }
			          else if(node.label == "subresume"){
			        	  color ="#bc8f8f"
			          }
			          else if(node.label == "subillegal"){
			        	  color ="#bc8f8f"
			          }
			          else if(node.label == "subreward"){
			        	  color ="#bc8f8f"
			          }
			          else if(node.label == "subleave"){
			        	  color ="#bc8f8f"
			          }
			          else if(node.label == "subtrain"){
			        	  color ="#bc8f8f"
			          }
		        return color;
	       })
	       .style('stroke',function(node){ //
		        var color;//圆圈边框的颜色
		        var link=links[node.index];//
		        if(link!=undefined){
			       if(node.title==link.source.title && node.title==chaxuntext){ 
			           color="#B43232";
			       }else{
			       	   if(node.label=="jg"){
			           	   color="#A254A2";
			           }else if(node.label=="criminal"){
			           	   color="#139584";
			           }else if(node.label=="infomation"){
			           	   color="#3A9AF3";
			           }
			       }
		        }
		        return color;
	        })
	        .attr("r", 30)//设置圆圈半径
	        .on("click",function(node){
		        //单击时让连接线加粗
		        edges_line.style("stroke-width",function(line){ 
			         if(line.source.title==node.title || line.target.title==node.title){//当与连接点连接时变粗
			            return 4;
			         }else{
				        return 1;
			         }
		        });
		        circle.style('stroke-width',1);//所有的圆圈边框
		        d3.select(this).style('stroke-width',4);//被选中的圆圈边框
	         })
	         .on("dblclick",function(d,i){
		        //双击节点时节点恢复拖拽
		        d.fixed = false;
		        force.stop();
		        if(d.dbclick==1){
		        	return;
		        }
		        if(d.label=="criminal"){
		        	$.get('../criminal/criminalGraph/'+d.jgbm+"/"+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
			 	        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });
		        }else if(d.label=="family"){//点击家庭显示家庭成员
		        	$.get('../family/familyGraph/'+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
				        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       }); 
		        }else if(d.label == "resume"){  //点击个人简历信息 
		        	$.get('../resume/resumeGraph/'+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
				        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });	
		        }else if(d.label == "illegal"){   //点击违法信息
		        	$.get('../illegal/illegalGraph/'+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
				        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });	
		        }else if(d.label == "reward"){  //点击奖惩信息
		        	$.get('../reward/rewardGraph/'+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
				        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });	
		        }else if(d.label == "train"){  //点击培训信息
		        	$.get('../train/trainGraph/'+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
				        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });	
		        }else if(d.label == "leave"){ //点击外出请假
		        	$.get('../leave/leaveGraph/'+d.rybh+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
		        		 if(showGraph){
				        	 if(showGraph.nodes){
				        		 for(var index in showGraph.nodes){
								     nodes.push(showGraph.nodes[index]);
							     }
				        	 }
				        	 if(showGraph.links){
				        		 for(var index in showGraph.links){
								     links.push(showGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });	
		        }
		        
		        d.dbclick=1;
	        })
	        .on("mouseover",function(d){
	        	if(d.label == "familymember"){
	        		 tooltip.html("名称:"+d.title+"<br />关系:"+d.relationship+"<br />地址:"+d.address)
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY + 20) + "px")
		                .style("opacity",1.0)
		                .style("display","block");
	        	}
	        	else if(d.label =="subresume"){
	        		tooltip.html("开始日期:"+d.title+"<br />结束日期:"+d.endtime+"<br />所在单位:"+d.unit+"<br />职位:"+d.job)
	                .style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY + 20) + "px")
	                .style("opacity",1.0)
	                .style("display","block");
	        	}
	        	else if(d.label =="subillegal"){
	        		tooltip.html("罪名:"+d.title+"<br />犯罪类型:"+d.category+"<br />时间:"+d.time)
	                .style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY + 20) + "px")
	                .style("opacity",1.0)
	                .style("display","block");
	        	}
	        	else if(d.label =="subleave"){
	        		tooltip.html("开始时间:"+d.title+"<br />结束时间:"+d.endtime+"<br />外出原因:"+d.reason)
	                .style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY + 20) + "px")
	                .style("opacity",1.0)
	                .style("display","block");
	        	}
	        	else if(d.label =="subreward"){
	        		tooltip.html("奖惩类型:"+d.title+"<br />奖惩原因:"+d.reason+"<br />奖惩时间:"+d.time)
	                .style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY + 20) + "px")
	                .style("opacity",1.0)
	                .style("display","block");
	        	}
	        	else if(d.label =="subtrain"){
	        		tooltip.html("开始时间:"+d.title+"<br />结束时间:"+d.endtime+"<br />培训类型:"+d.category+"<br />培训内容:"+d.content)
	                .style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY + 20) + "px")
	                .style("opacity",1.0)
	                .style("display","block");
	        	}
	        	else{
	        		tooltip.html("类型:"+d.label+"<br />名称:"+d.title)
	                .style("left", (d3.event.pageX) + "px")
	                .style("top", (d3.event.pageY + 20) + "px")
	                .style("opacity",1.0)
	                .style("display","block");
	        	}
		         
	        })
	       .on("mousemove",function(d){
		         tooltip.style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY + 20) + "px");
	       })
	       .on("mouseout",function(d){
		         tooltip.style("opacity",0.0);
		         tooltip.style("display","none");
	       })
	       .call(drag(force,d3));//使顶点可以被拖动
	
	svg.selectAll("g").call(drag(force,d3));//为svg下的所有g标签添加拖拽事件
	svg.on("dblclick.zoom", null);//取消svg和圆圈的双击放大事件（d3中默认开启7个事件，关闭防止与上面的双击事件冲突）
	circle.on("dblclick.zoom", null);
	circle.exit().remove();
	
	text = text.data(nodes);//返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
	text.enter()
	    .insert("text")//添加text标签
	    .attr("dy", ".35em") //将文字下移 
	    .attr("text-anchor", "middle")//在圆圈中加上数据  
	    .style('fill',function(node){
		    var color;//文字颜色
		    var link=links[node.index];
		    if(link!=undefined){
		       if(node.title==link.source.title && node.title==chaxuntext){
		           color="#B43232";
			   }else{
				   color="#A254A2";
			   }
		    }
		    return color;
	     })
	     .attr('x',function(d){
	    	 /*
		     var re_en = /[a-zA-Z]+/g;
	 	     //如果是全英文，不换行
		     if(d.title.match(re_en)){
		         d3.select(this).append('tspan')//添加tspan用来方便时使用绝对或相对坐标来调整文本
		           .attr('x',0)
		           .attr('y',2)
		           .text(function(){return d.title;});
		      }else
		      */
		    if(d.title.length<=8){//如果小于8个字符，不换行
		         d3.select(this).append('tspan')
		           .attr('x',0)
		           .attr('y',2)
		           .text(function(){return d.title;});
		      }else if(d.title.length>=16){//大于16个字符时，将14个字后的内容显示为。。。
		         var top=d.title.substring(0,8);
		         var bot=d.title.substring(8,14)+"...";
			     d3.select(this).text(function(){return '';});
			     d3.select(this).append('tspan')//前n个字
			       .attr('x',0)
			       .attr('y',-7)
			       .text(function(){return top;});
			     d3.select(this).append('tspan')//后n个字
			       .attr('x',0)
			       .attr('y',10)
			       .text(function(){return bot;});
		      }else {//8-16字符分两行显示
			     var top=d.title.substring(0,8);
			     var bot=d.title.substring(8,d.title.length);
			     d3.select(this).text(function(){return '';});
			     d3.select(this).append('tspan')
			       .attr('x',0)
			       .attr('y',-7)
			       .text(function(){return top;});
			     d3.select(this).append('tspan')
			       .attr('x',0)
			       .attr('y',10)
			       .text(function(){return bot;});
		      }
	});
	text.exit().remove();
	force.on("tick",function(){
		circle.attr("transform", transform1);//圆圈
		text.attr("transform", transform1);//顶点文字
		edges_line.attr('d', function(d) { //连接线
			var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
			return path;
		});
		edges_text.attr('transform',function(d,i){//连线上的文字
			if (d.target.x<d.source.x){//判断起点和终点的位置，来让文字一直显示在线的上方且一直是正对用户
				bbox = this.getBBox();//获取矩形空间,并且调整翻转中心。（因为svg与css中的翻转不同，具体区别可看http://www.zhangxinxu.com/wordpress/2015/10/understand-svg-transform/）
				rx = bbox.x+bbox.width/2; 
				ry = bbox.y+bbox.height/2;
				return 'rotate(180 '+rx+' '+ry+')';
			}else {
				return 'rotate(0)';
			}    
		})
		.attr('dx',function(d,i){
			return Math.sqrt(Math.pow(d.target.x-d.source.x,2)+Math.pow(d.target.y-d.source.y,2))/2-20;
			//设置文字一直显示在线的中间
		});
	});
}


function drag(force,d3){//拖拽函数
	return force.drag().on("dragstart",function(d){
		d3.event.sourceEvent.stopPropagation(); //取消默认事件
		d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
	});
}

//设置圆圈和文字的坐标
function transform1(d) {
	return "translate(" + d.x + "," + d.y + ")";
}