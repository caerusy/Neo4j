var marge = {top:60,bottom:60,left:60,right:60};
var svg;
var width;
var height;
var g;

//准备数据
var nodes = [];
var edges = [];
//新建一个力导向图
var forceSimulation;
//有了节点和边的数据后，我们开始绘制
//绘制边
var links;
var linksText;
//绘制节点
//老规矩，先为节点和节点上的文字分组
var gs;//圆及圆上的文字
var marker;
var tooltip;

function showGraph(queryName){
	if(!queryName){
		queryName="null";
	}
	$.get('./movieGraphByName/'+queryName,{ts:new Date().getTime()}, function(graph) {//初始显示所有person
		if(graph && graph.nodes){
			for(var index in graph.nodes){
				nodes.push(graph.nodes[index]);
			}
		}
		
		if(graph && graph.links){
			for(var index in graph.links){
				edges.push(graph.links[index]);
			}
		}
		svg = d3.select("svg")
		width = svg.attr("width")
		height = svg.attr("height")
		g = svg.append("g").attr("transform","translate("+marge.top+","+marge.left+")");
		
		svg.call(d3.zoom().scaleExtent([0.05, 8]).on('zoom',function(){
            // 保存当前缩放的属性值
            var transform = d3.event.transform;
            g.attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        })).on('dblclick.zoom', null);
	
		 //箭头
		marker= svg.append("marker")//注意SVG规范中明确指出，附加到一个'Marker'元素上的“事件属性和事件的listener”不会被处理，//添加一个marker标签来绘制箭头
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
		tooltip = d3.select("body").append("div")//添加div并设置成透明
                    .attr("class","tooltip").style("opacity",0.0);
		//新建一个力导向图
	    forceSimulation = d3.forceSimulation()
		                    .force("link",d3.forceLink())
		                    .force('collision', d3.forceCollide(1).strength(0.1))
		                    .force("charge",d3.forceManyBody().strength(-1200).distanceMax(800))
		                    .force("center",d3.forceCenter()).alphaTarget(1)
		                    .force("x", d3.forceX())
                            .force("y", d3.forceY());
		//初始化力导向图，也就是传入数据
		//生成节点数据
		forceSimulation.nodes(nodes).on("tick",ticked);//这个函数很重要，后面给出具体实现和说明
		//生成边数据
		forceSimulation.force("link").links(edges).distance(100)    	
		//设置图形的中心位置	
		forceSimulation.force("center").x(width/2).y(height/2);
		
		links = g.append("g").selectAll(".edgepath");
		linksText = g.append("g").selectAll(".edgelabel");
		gs = g.selectAll(".circleText");
		//有了节点和边的数据后，我们开始绘制
		update();
	}); 
}


function update(){
	forceSimulation.nodes(nodes);
	forceSimulation.force("link").links(edges);
	//绘制边
	links = links.data(edges,function(d) { return d.source.title + "-" + d.target.title; });
	links.exit().remove();
	links=links.enter().append("path")
	         .attr("stroke","#A254A2")
	         .attr("stroke-width",1)
	         .attr('d', function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y})//变量 d 是由D3.js提供的一个在匿名函数中的可用变量。这个变量是对当前要处理的元素的_data_属性的引用。
             .attr('class','edgepath')//定义该path标签class为edgepath
             .attr('id',function(d,i) {return 'edgepath'+i;})// i也是d3.js提供的变量，表示当前处理的HTML元素在已选元素选集中的索引值
	         .attr("marker-end", "url(#resolved)").merge(links);//根据箭头标记的id号引用箭头
	         
	linksText = linksText.data(edges,function(d) { return d.source.title + "-" + d.target.title; });
	linksText.exit().remove();
	linksText=linksText.enter()
	             .append("text")
	             .attr('class','edgelabel').merge(linksText)
                 .attr('id',function(d,i){return 'edgepath'+i;})
	             .attr('dx',70).attr('dy',15);
	linksText.append('textPath') //设置线条上的文字路径
             .attr('xlink:href',function(d,i) {return '#edgepath'+i})
             .style("pointer-events", "none")
             .text(function(d){return d.relation;});
	gs = gs.data(nodes,function(d) { return d.title;});
	gs.exit().remove();
	gs=gs.enter().append("g").merge(gs)	
	      .attr("transform",function(d,i){
		      var cirX = d.x;
		      var cirY = d.y;
		      return "translate("+cirX+","+cirY+")";
	      })
	     .call(d3.drag().on("start",started).on("drag",dragged).on("end",ended)) 
	     .on("click",function(node){
	 	    //单击时让连接线加粗
	     	links.style("stroke-width",function(line){ 
	 	        if(line.source.title==node.title || line.target.title==node.title){//当与连接点连接时变粗
	 	            return 4;
	 	        }else{
	 			    return 1;
	 			}
	 	    });
	     	gs.style('stroke-width',1);//所有的圆圈边框
	 		d3.select(this).style('stroke-width',4);//被选中的圆圈边框
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
	      .on("dblclick",function(d,i){
		      //双击节点时节点恢复拖拽
		     // d.fixed = false;
		      if(d.label=="Movie" && d.dbclick==0){//点击人物，出来电影的评分
		    	  $.get('../show/showGraph/'+d.title+"/"+d.index+"/"+nodes.length,{ts:new Date().getTime()}, function(showGraph){
				     if(showGraph){
				       	 if(showGraph.nodes){
				       		 for(var index in showGraph.nodes){
				       			 nodes.push(showGraph.nodes[index]);
						     }
				       	 }
				       	 if(showGraph.links){
				       		 for(var index in showGraph.links){
				       			edges.push(showGraph.links[index]);
						     }
				       	 }
				       	 update();
				     }
				     d.dbclick=1;
			    });            	
		     }
	      });
	//绘制节点
	gs.append("circle").attr("r",30)
	  .attr("fill",function(d){
		   var color;//圆圈背景色
		   if(d.label=="Person"){
              color="#F9EBF9";
           }else if(d.label=="Movie"){
              color="#48F1EB";
           }else if(d.label=="Show"){
              color="#7FBEF9";
           }
		   return color;
	  })
	  .style('stroke',function(node){ //
	       var color;//圆圈边框的颜色
	       if(node.label=="Person"){
		      color="#A254A2";
		   }else if(node.label=="Movie"){
		      color="#139584";
		   }else if(node.label=="Show"){
		      color="#3A9AF3";
		   }
	       return color;
       });
	//文字
	gs.append("text")
	  .attr("dy",".35em")
	  .attr('x',function(d){
	      if(d.title.length<=8){//如果小于8个字符，不换行
	         d3.select(this).append('tspan')
	           .attr('x',-14)
	           .attr('y',0)
	           .text(function(){return d.title;});
	      }else if(d.title.length>=16){//大于16个字符时，将14个字后的内容显示为。。。
	         var top=d.title.substring(0,8);
	         var bot=d.title.substring(8,14)+"...";
		     d3.select(this).text(function(){return '';});
		     d3.select(this).append('tspan')//前n个字
		       .attr('x',-20)
		       .attr('y',-7)
		       .text(function(){return top;});
		     d3.select(this).append('tspan')//后n个字
		       .attr('x',-20)
		       .attr('y',10)
		       .text(function(){return bot;});
	      }else {//8-16字符分两行显示
		     var top=d.title.substring(0,8);
		     var bot=d.title.substring(8,d.title.length);
		     d3.select(this).text(function(){return '';});
		     d3.select(this).append('tspan')
		       .attr('x',-20)
		       .attr('y',-7)
		       .text(function(){return top;});
		     d3.select(this).append('tspan')
		       .attr('x',-20)
		       .attr('y',10)
		       .text(function(){return bot;});
	      }
	 });
	
	forceSimulation.alpha(1).restart();
}

function ticked(){
	gs.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	links.attr('d', function(d) { //连接线
		var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
		return path;
	});

	linksText.attr('transform',function(d,i){//连线上的文字
		if (d.target.x<d.source.x){//判断起点和终点的位置，来让文字一直显示在线的上方且一直是正对用户
			if(d.display!='none'){
				bbox = this.getBBox();//获取矩形空间,并且调整翻转中心。（因为svg与css中的翻转不同，具体区别可看http://www.zhangxinxu.com/wordpress/2015/10/understand-svg-transform/）
				rx = bbox.x+bbox.width/2; 
				ry = bbox.y+bbox.height/2;
				return 'rotate(180 '+rx+' '+ry+')';
			}
		}else {
			return 'rotate(0)';
		}
	})
	.attr('dx',function(d,i){
		return Math.sqrt(Math.pow(d.target.x-d.source.x,2)+Math.pow(d.target.y-d.source.y,2))/2-20;
		//设置文字一直显示在线的中间
	});
}
function started(d){
	if(!d3.event.active){
		forceSimulation.alphaTarget(.1).restart();
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
		forceSimulation.alphaTarget(0);
	}
	d.fx = null;
	d.fy = null;
}