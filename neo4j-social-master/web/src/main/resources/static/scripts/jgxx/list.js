$(function () {
	$('#searchBtn').click(function(){
		pageaction();
	});

});

var pageaction = function(){
	var queryName=$("#xm").val();//要查询的名字
	showGraph(queryName);	
}


//分页结束
var artdialog ;

function closeDialog() {
	artdialog.close();
}

