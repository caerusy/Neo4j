var chaxuntext;
var width = 800, height = 800;
var marge = {top:60,bottom:60,left:60,right:60}
var nodes=[];//保存节点信息
var links=[];//保存关系信息

var simulation;



var edges_line;//定义关系连线
var edges_text;//定义关系上显示的名称
var circle;//定义节点
var text;//定义节点上显示的文字
var svg;//定义力导向图，由于svg用到document中的svg元素，加载js时document还没初始化完毕，所以不能在js中调用document的svg元素，svg的初始化放到了showGraph函数中
var allg;
var color = d3.scaleOrdinal(d3.schemeCategory10);

function showGraph(queryName){
	$("svg").empty();//清除画布上的内容，每次查询前先清除上次查询的结果
	nodes=[];
	links=[];//清除画布上的内容，每次查询前先清除上次查询的结果
	chaxuntext=queryName;
	/*
	var zoom = d3.zoom()//缩放配置，
    .scaleExtent([0, 2])//缩放比例
    .on("zoom", function(){
        svg.selectAll("g").attr("transform",//svg下的g标签移动大小
	     "translate("  +d3.event.translate + ")scale(" +d3.event.scale + ")");
});
*/
	
	svg = d3.select("svg").attr("pointer-events", "all");//.call(zoom);
    allg = svg.append("g").attr("transform","translate("+marge.top+","+marge.left+")");
    //箭头
	var marker= allg.append("marker")//注意SVG规范中明确指出，附加到一个'Marker'元素上的“事件属性和事件的listener”不会被处理，//添加一个marker标签来绘制箭头
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
	$.get('./personGraph/'+queryName,{ts:new Date().getTime()}, function(graph) {//初始显示所有person
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
		
		simulation=d3.forceSimulation(nodes)
		.force("charge", d3.forceManyBody().strength(-1000))
	    .force("link", d3.forceLink(links).distance(200))
	    .force("x", d3.forceX())
	    .force("y", d3.forceY())
	    //.force("center").x(width/2).y(height/2)
	    .alphaTarget(1)
	    .on("tick", ticked);

		edges_line = allg.append("g").selectAll("line");
		edges_text = allg.append("g").selectAll(".edgelabel");
		circle = allg.append("g").selectAll("circle")
		text = allg.append("g").selectAll("text");
		update();//显示力导向图
	}); 
}


function update(){
	var tooltip = d3.select("body")
                    .append("div")//添加div并设置成透明
                    .attr("class","tooltip")
                    .style("opacity",0.0);
	edges_line = edges_line.data(links);//连线数据
	edges_line.enter()//当数组中的个数大于元素个数时，由d3创建空元素并与数组中超出的部分进行绑定。enter()只对对新添加的数据生成元素，已经有的数据不会再重新生成元素
	          .append("line")//添加path标签
	          //.attr('d',function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y})//变量 d 是由D3.js提供的一个在匿名函数中的可用变量。这个变量是对当前要处理的元素的_data_属性的引用。)
	          //.attr('class','edgepath')//定义该path标签class为edgepath
		      //.attr('id',function(d,i) {return 'edgepath'+i;})// i也是d3.js提供的变量，表示当前处理的HTML元素在已选元素选集中的索引值
		      .attr("stroke","#A254A2")//设置线条颜色
		      .attr("stroke-width",1)//线条粗细
	 //         .attr("marker-end", "url(#resolved)")//根据箭头标记的id号引用箭头
	          .merge(edges_line);
	edges_line.exit().remove();//exit()删除多余的元素
    //连线上的文字
	edges_text = edges_text.data(links);
	edges_text.enter()
	          .append("text")//添加text标签
	          .attr('class','edgelabel')
	          .attr('id',function(d,i){return 'edgepath'+i;})
	          .attr('dx',70)
	          .attr('dy',15)
	          //.append('textPath')
	          //.attr('xlink:href',function(d,i) {return '#edgepath'+i})
              .style("pointer-events", "none")
              .text(function(d){return d.relation;})
              .merge(edges_text); 
	edges_text.exit().remove();
    //圆圈
	circle = circle.data(nodes);//表示使用force.nodes数据
	circle.enter()
	      .insert("circle")
	      .style("fill",function(node){
		       var color;//圆圈背景色
		       var link=links[node.index];
		       if(link!=undefined){
			      if(link.source.title==node.title && node.title==chaxuntext){
			          color="#F6E8E9";
			      }else{
			          if(node.label=="Person"){
			          	 color="#F9EBF9";
			          }else if(node.label=="Movie"){
			          	 color="#48F1EB";
			          }else if(node.label=="Show"){
			        	 color="#7FBEF9";
			          }
			      }
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
			       	   if(node.label=="Person"){
			           	   color="#A254A2";
			           }else if(node.label=="Movie"){
			           	   color="#139584";
			           }else if(node.label=="Show"){
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
		       // force.stop();
		        if(d.label=="Person"){//点击人物，出来电影的评分
		        	 $.get('./movieGraph/'+d.title+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(movieGraph){
				         if(movieGraph){
				        	 if(movieGraph.nodes){
				        		 for(var index in movieGraph.nodes){
								     nodes.push(movieGraph.nodes[index]);
							     }
				        	 }
				        	 if(movieGraph.links){
				        		 for(var index in movieGraph.links){
								     links.push(movieGraph.links[index]);
							     }
				        	 }
				        	 update();
				         }
			       });            	
		        }else if(d.label=="Movie"){//点击电影，出来电影的上映节目
		        	$.get('../show/showGraph/'+d.title+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
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
	        })
	        .on("mouseover",function(d){
		         tooltip.html("类型:"+d.label+"<br />名称:"+d.title)
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY + 20) + "px")
		                .style("opacity",1.0)
		                .style("display","block");
	        })
	       .on("mousemove",function(d){
		         tooltip.style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY + 20) + "px");
	       })
	       .on("mouseout",function(d){
		         tooltip.style("opacity",0.0);
		         tooltip.style("display","none");
	       })
	       .call(d3.drag()
	    			.on("start",started)
	    			.on("drag",dragged)
	    			.on("end",ended)
	    		)//使顶点可以被拖动
	    .merge(circle);
	
	svg.selectAll("g").call(d3.drag()
			.on("start",started)
			.on("drag",dragged)
			.on("end",ended)
		);//为svg下的所有g标签添加拖拽事件
	svg.on("dblclick.zoom", null);//取消svg和圆圈的双击放大事件（d3中默认开启7个事件，关闭防止与上面的双击事件冲突）
	circle.on("dblclick.zoom", null);
	circle.exit().remove();
	
	text = text.data(nodes);//返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
	text.enter()
	    .append("text")//添加text标签
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
	})
	 .merge(text);
	text.exit().remove();
	simulation.nodes(nodes);
	simulation.force("link").links(links);
	simulation.alpha(1).restart();
}


function started(d){
	if(!d3.event.active){
		simulation.alphaTarget(0.8).restart();
	}
	d.fx = d.x;
	d.fy = d.y;
}
function dragged(d){
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}
function ended(d){
	if(!d3.event.active){
		simulation.alphaTarget(0);
	}
	d.fx = null;
	d.fy = null;
}


function ticked() {
	
	circle.attr("transform", transform1);//圆圈
	text.attr("transform", transform1);//顶点文字
	
	edges_line.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
	
	/*
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
	
	
	edges_line.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
	circle.attr("cx", function(d) { return d.x; })
     .attr("cy", function(d) { return d.y; })
     */
}

//设置圆圈和文字的坐标
function transform1(d) {
	return "translate(" + d.x + "," + d.y + ")";
}