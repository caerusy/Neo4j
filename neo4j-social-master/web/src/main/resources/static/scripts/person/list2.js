$(function () {
	$('#searchBtn').click(function(){
		pageaction();
	});
	$('#addInfo').click(function(){
		create();
	});
	//初始化分页
	pageaction();
	var pg = $('.pagination');
	$('#pageSelect').live("change",function(){
		pg.trigger('setPage', [$(this).val()-1]);
	});
	
});

//分页的参数设置
var getOpt = function(){
	var opt = {
			items_per_page: 10,	//每页记录数
			num_display_entries: 3, //中间显示的页数个数 默认为10
			current_page:0,	//当前页
			num_edge_entries:1, //头尾显示的页数个数 默认为0
			link_to:"javascript:void(0)",
			prev_text:"上页",
			next_text:"下页",
			load_first_page:true,
			show_total_info:true ,
			show_first_last:true,
			first_text:"首页",
			last_text:"尾页",
			hasSelect:false,
			callback: pageselectCallback //回调函数
	}
	return opt;
}
//分页开始
var currentPageData = null ;
var pageaction = function(){
	$.get('./list?t='+new Date().getTime(),{
		name:$("#name").val(),create:$("#create").val()
	},function(data){
		currentPageData = data.content;
		$(".pagination").pagination(data.totalElements, getOpt());
	});
	showGraph();	
}

var pageselectCallback = function(page_index, jq, size){
	if(currentPageData!=null){
		fillData(currentPageData);
		currentPageData = null;
	}else
		$.get('./list?t='+new Date().getTime(),{
			size:size,page:page_index,name:$("#name").val(),create:$("#create").val()
		},function(data){
			fillData(data.content);
		});
}
//填充分页数据
function fillData(data){
	var $list = $('#tbodyContent').empty();
	$.each(data,function(k,v) {
		var html = "";
		html += '<tr> ' +
		'<td>' + (v.id == null ? '' : v.id) + '</td>' +
		'<td>' + (v.name == null ? '' : v.name) + '</td>' +
		'<td>' + (v.create == null ? '' : getSmpFormatDateByLong(v.create, true)) + '</td>';
		html += '<td><a class="c-50a73f mlr-6" href="javascript:void(0)" onclick="showDetail(\'' + v.id + '\')">查看</a>';

		html += '<a class="c-50a73f mlr-6" href="javascript:void(0)" onclick="edit(\'' + v.id + '\')">修改</a>';

		html += '<a class="c-50a73f mlr-6" href="javascript:void(0)" onclick="del(\''+ v.id+'\')">删除</a>';

		html += '<a class="c-50a73f mlr-6" href="javascript:void(0)" onclick="rating(\''+ v.id+'\')">评分</a>';

		html +='</td></tr>' ;

		$list.append($(html));
	});
}
//分页结束
var artdialog ;
function showDetail(id){
	$.get("./"+id,{ts:new Date().getTime()},function(data){
		art.dialog({
			lock:true,
			opacity:0.3,
			title: "查看信息",
			width:'750px',
			height: 'auto',
			left: '50%',
			top: '50%',
			content:data,
			esc: true,
			init: function(){
				artdialog = this;
			},
			close: function(){
				artdialog = null;
			}
		});
	});
}
function edit(id){
	$.get("./edit/"+id,{ts:new Date().getTime()},function(data){
		art.dialog({
			lock:true,
			opacity:0.3,
			title: "修改",
			width:'750px',
			height: 'auto',
			left: '50%',
			top: '50%',
			content:data,
			esc: true,
			init: function(){
				artdialog = this;
			},
			close: function(){
				artdialog = null;
			}
		});
	});
}
function rating(id){
	$.get("./rating/"+id,{ts:new Date().getTime()},function(data){
		art.dialog({
			lock:true,
			opacity:0.3,
			title: "评分",
			width:'750px',
			height: 'auto',
			left: '50%',
			top: '50%',
			content:data,
			esc: true,
			init: function(){
				artdialog = this;
			},
			close: function(){
				artdialog = null;
			}
		});
	});
}
function del(id){
	if(!confirm("您确定删除此记录吗？")){
		return false;
	}
	$.get("./delete/"+id,{ts:new Date().getTime()},function(data){
		if(data==1){
			alert("删除成功");
			pageaction();
		}else{
			alert(data);
		}
	});
}
function create(){
	$.get("./new",function(data){
		art.dialog({
			lock:true,
			opacity:0.3,
			title: "新增",
			width:'750px',
			height: 'auto',
			left: '50%',
			top: '50%',
			content:data,
			esc: true,
			init: function(){
				artdialog = this;
			},
			close: function(){
				artdialog = null;
			}
		});
	});
}


function showGraph(){
   var chaxuntext=$(".name").text;
   var queryName=$("#name").val();//要查询的名字
   var width = 800, height = 800;
   
   $("svg").empty();//清除画布上的内容，每次查询前先清除上次查询的结果
   
   var force = d3.layout.force()//layout将json格式转化为力学图可用的格式
                 .size([width, height])//大小
                 .linkDistance(150)//连接线长度
                 .charge(-1500);//值为+，则相互吸引，绝对值越大吸引力越大。值为-，则相互排斥，绝对值越大排斥力越大
   var zoom = d3.behavior.zoom()//缩放配置，
                .scaleExtent([0, 2])//缩放比例
                .on("zoom", function(){
                	 svg.selectAll("g").attr("transform",//svg下的g标签移动大小
                	            "translate("  +d3.event.translate + ")scale(" +d3.event.scale + ")");
                });
  
   var svg = d3.select("svg")
               .attr("width", width)
               .attr("height", height)
               .attr("pointer-events", "all")
               .call(zoom); 
 //箭头
   var marker=//注意SVG规范中明确指出，附加到一个'Marker'元素上的“事件属性和事件的listener”不会被处理
       svg.append("marker")//添加一个marker标签来绘制箭头
       .attr("id", "resolved")//箭头id，用于其他标记进行引用时的url
       .attr("markerUnits","userSpaceOnUse")//定义标记的坐标系统，userSpaceOnUse表示按照引用的元件来决定，strokeWidth按照用户单位决定
       .attr("viewBox", "0 -5 10 10")//坐标系的区域
       .attr("refX",40)//箭头坐标
       .attr("refY", 0)
       .attr("markerWidth", 12)//标识的大小
       .attr("markerHeight", 12)
       .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
       .attr("stroke-width",3)//箭头宽度
       .append("path")
       .attr("d", "M0,-5L10,0L0,5")//绘制箭头，路径为一个三角形，有疑问参考svg的path http://www.runoob.com/svg/svg-path.html
       .attr('fill','#000000');//箭头颜色

   var tooltip = d3.select("body")
                   .append("div")//添加div并设置成透明
                   .attr("class","tooltip")
                   .style("opacity",0.0);
    if(!queryName){
    	queryName="null";
    }
    $.get('./personGraph/'+queryName,{ts:new Date().getTime()}, function(graph) {
    	force.nodes(graph.nodes).links(graph.links).start();
      //设置连接线    
        var edges_line = svg.append("g").selectAll(".edgepath")
            .data(force.links())//连线数据
            .enter()//当数组中的个数大于元素个数时，由d3创建空元素并与数组中超出的部分进行绑定。
            .append("path")//添加path标签
            .attr({
                  'd': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},//变量 d 是由D3.js提供的一个在匿名函数中的可用变量。这个变量是对当前要处理的元素的_data_属性的引用。
                  'class':'edgepath',//定义该path标签class为edgepath
                  'id':function(d,i) {return 'edgepath'+i;}})// i也是d3.js提供的变量，表示当前处理的HTML元素在已选元素选集中的索引值
            .style("stroke","#A254A2")//设置线条颜色
            .style("stroke-width",1)//线条粗细
            .attr("marker-end", "url(#resolved)" );//根据箭头标记的id号引用箭头

        //连线上的文字
        var edges_text = svg.append("g").selectAll(".edgelabel")
                            .data(force.links())
                            .enter()
                            .append("text")//添加text标签
                            .attr({  'class':'edgelabel',//定义该text标签class为edgelabel
                               'id':function(d,i){return 'edgepath'+i;},
                               'dx':70,//在连线上的坐标
                               'dy':15
                            });
        //设置线条上的文字路径
        edges_text.append('textPath')
                  .attr('xlink:href',function(d,i) {return '#edgepath'+i})
                  .style("pointer-events", "none")
                  .text(function(d){return d.relation;}); 
         
      //圆圈
        var circle = svg.append("g") 
        	.selectAll("circle")
            .data(force.nodes())//表示使用force.nodes数据
            .enter().append("circle")
            .style("fill",function(node){
                var color;//圆圈背景色
                var link=graph.links[node.index];
                if(link!=undefined){
                    if(link.source.title==node.title && node.title==chaxuntext){
                        color="#F6E8E9";
                    }else{
                        color="#F9EBF9";
                    }
                }
                return color;
            })
            .style('stroke',function(node){ //
                var color;//圆圈边框的颜色
                var link=graph.links[node.index];//
                if(link!=undefined){
                   if(node.title==link.source.title && node.title==chaxuntext){ 
                      color="#B43232";
                   }else{
                      color="#A254A2";
                   }
                }
                return color;
            })
            .attr("r", 38)//设置圆圈半径
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
            	 $.get('./movieGraph/'+d.title+"/"+d.index+"/"+graph.nodes.length,{ts:new Date().getTime()}, function(movieGraph){
            		if(movieGraph.nodes.length>0){
            			force.stop();
            			graph.nodes.push(movieGraph.nodes[0]);
            			graph.links.push(movieGraph.links[0]);
            			force.nodes(graph.nodes).links(graph.links);
            			force.start();
            			
               			edges_line = edges_line.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });
               			edges_line.exit().remove();
               			edges_line.enter().insert("path", "circle").attr("class", "edgepath");//设置线条颜色;
               			             			
               			circle=circle.data(graph.nodes, function(d) { return d.title;});
               			circle.exit().remove();
               			circle.enter().append("circle").attr("r", 38).style("fill","#F9EBF9");//使顶点可以被拖动;
               			
               			var nodeEnter = circle.enter().append("g")
               	                     .attr("class", "node")
               	                     .call(force.drag);

               	        nodeEnter.append("text")
               	                 .attr("dy", ".35em")
               	  		         .attr("dx", "1em")
               	                 .text(function(d) { return d.title; });
            			            			
            		}
            		 
            		
               
            	 });            	
            })
                        
            .on("mouseover",function(d){
    	        tooltip.html(d.title+ "的介绍为XXX.")
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
            .call(drag(force,d3));//使顶点可以被拖动
        	svg.selectAll("g").call(drag(force,d3));//为svg下的所有g标签添加拖拽事件
        	//svg.selectAll("circle").call(drag());
        	//svg.selectAll("path").call(drag());
            svg.on("dblclick.zoom", null);//取消svg和圆圈的双击放大事件（d3中默认开启7个事件，关闭防止与上面的双击事件冲突）
            circle.on("dblclick.zoom", null);
        	
        var text = svg.append("g").selectAll("text")
            .data(force.nodes())
            //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
            .enter()
            .append("text")//添加text标签
            .attr("dy", ".35em") //将文字下移 
            .attr("text-anchor", "middle")//在圆圈中加上数据  
            .style('fill',function(node){
                var color;//文字颜色
                var link=graph.links[node.index];
                if(link!=undefined){
                    if(node.title==link.source.title && node.title==chaxuntext){
                       color="#B43232";
                    }else{
                       color="#A254A2";
                    }
                }
                return color;
            }).attr('x',function(d){
                // console.log(d.name+"---"+ d.name.length);
                var re_en = /[a-zA-Z]+/g;
                //如果是全英文，不换行
                if(d.title.match(re_en)){
                     d3.select(this).append('tspan')//添加tspan用来方便时使用绝对或相对坐标来调整文本
                     .attr('x',0)
                     .attr('y',2)
                     .text(function(){return d.title;});
                }
                //如果小于8个字符，不换行
                else if(d.title.length<=8){
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
    }); 
	
	
    /*利用V5版本显示
	var marge = {top:60,bottom:60,left:60,right:60}
	var svg = d3.select("svg")
	var width = svg.attr("width")
	var height = svg.attr("height")
	var g = svg.append("g").attr("transform","translate("+marge.top+","+marge.left+")");
	$.get('./personGraph', function(graph) {
		//设置一个color的颜色比例尺，为了让不同的扇形呈现不同的颜色
		var nodes=graph.nodes;
		var edges=graph.links;
		var colorScale = d3.scaleOrdinal()
		.domain(d3.range(nodes.length))
		.range(d3.schemeCategory10);

		//新建一个力导向图
		var forceSimulation = d3.forceSimulation()
		.force("link",d3.forceLink())
		.force("charge",d3.forceManyBody())
		.force("center",d3.forceCenter());;

		//初始化力导向图，也就是传入数据
		//生成节点数据
		forceSimulation.nodes(nodes)
		.on("tick",function() {
			//if(forceSimulation.alpha()<=0.05){// 足够稳定时，才渲染一次

				links.attr("x1",function(d){return d.source.x;})
				.attr("y1",function(d){return d.source.y;})
				.attr("x2",function(d){return d.target.x;})
				.attr("y2",function(d){return d.target.y;});
				linksText.attr("x",function(d){
					return (d.source.x+d.target.x)/2;
				})
				.attr("y",function(d){
					return (d.source.y+d.target.y)/2;
				});
				gs.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			//	forceSimulation.stop(); // 渲染完成后立即停止刷新
			//}
		});//这个函数很重要，后面给出具体实现和说明
		//生成边数据
		forceSimulation.force("link")
		.links(edges)
		.distance(function(d){//每一边的长度
			return 2*100;
		})    	
		//设置图形的中心位置	
		forceSimulation.force("center")
		.x(width/2)
		.y(height/2);

		
		//有了节点和边的数据后，我们开始绘制
		//绘制边
		var links = g.append("g")
		.selectAll("line")
		.data(edges)
		.enter()
		.append("line")
		.attr("stroke",function(d,i){
			return colorScale(i);
		})
		.attr("stroke-width",1);
		var linksText = g.append("g")
		.selectAll("text")
		.data(edges)
		.enter()
		.append("text")
		.text(function(d){
			return d.relation;
		})

		//绘制节点
		//老规矩，先为节点和节点上的文字分组
		var gs = g.selectAll(".circleText")
		.data(nodes)
		.enter()
		.append("g")
		.attr("transform",function(d,i){
			var cirX = d.x;
			var cirY = d.y;
			return "translate("+cirX+","+cirY+")";
		})
		.call(d3.drag()
				.on("start",function(d){
					if(!d3.event.active){
						forceSimulation.alphaTarget(0.8).restart();
					}
					d.fx = d.x;
					d.fy = d.y;
				})
				.on("drag",function(d){
					d.fx = d3.event.x;
					d.fy = d3.event.y;
				})
				.on("end",function(d){
					if(!d3.event.active){
						forceSimulation.alphaTarget(0);
					}
					d.fx = null;
					d.fy = null;
				})
		);

		//绘制节点
		gs.append("circle")
		  .attr("r",10)
		  .attr("fill",function(d,i){
			  return colorScale(i);
		   })
		  .on("mouseover",function(d,i){
			  d3.select(this).attr("fill","yellow");
		  })
		  .on("mouseout",function(d,i){
			  d3.select(this).attr("fill","rgb(31, 119, 180)");
		  });
		//文字
		gs.append("text")
		.attr("x",-10)
		.attr("y",-20)
		.attr("dy",10)
		.text(function(d){
			return d.title;
		})
	}); 
	*/
}

function drag(force,d3){//拖拽函数
    return force.drag().on("dragstart",function(d){
				d3.event.sourceEvent.stopPropagation(); //取消默认事件
 				d.fixed = true;    //拖拽开始后设定被拖拽对象为固定
			});
			//.on("drag", dragmove);
}

//设置圆圈和文字的坐标
function transform1(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function closeDialog() {
	artdialog.close();
}
