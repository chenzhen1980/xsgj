/**
 * 立即定位
 */
var configDialog;
ImmeLocation = function(){
	var immeLocationMap = null;
	resultCount = 10;
	return {
		//全部内容
		all:function(){
			$('#immeLocationDIV').mask('加载中……');
			$("#comDeptEmpTree").tree({
				url:'/pc/immeUserInfo/tree.htm',
				checkbox:true,
				onLoadSuccess:function(){
					$('#immeLocationDIV').unmask();
				},
				onClick: function(node){
					if(node&&node.iconCls=='employee'){
						var empId = node.attributes;
						if(immeLocationMap){
							var overlay = immeLocationMap.getOverlayById(empId);
							if(overlay){
								ImmeLocation.closeFailDiv();
								immeLocationMap.openOverlayTip(empId);
							}else{
								immeLocationMap.closeTip();
								if($('#'+empId)){
									var text = $('#'+empId).text();
									$('#failinfo').html(text);
									$('#failInfoDiv').show();
								}else{
									ImmeLocation.closeFailDiv();
								}
							}
						}else{
							ImmeLocation.closeFailDiv();
						}
					}
				},
				onLoadError:function(){
					Ict.error('部门树初始化失败！');
					$('#immeLocationDIV').unmask();
				}
			}).load();
		},
		//人员树初始化
		treeInit:function(){
			$('#immeLocationDIV').mask('加载中……');
			$('#keyword').searchbox({  
			    searcher:function(value,name){
			    	if(value){
			    		$('#immeLocationDIV').mask('加载中……');
			    		var url = encodeURI('/pc/immeUserInfo/tree.htm?keyword='+value);
			    		$("#comDeptEmpTree").tree({
							url:url,
							checkbox:true,
							onLoadSuccess:function(){
								$('#immeLocationDIV').unmask();
							},
							onLoadError:function(){
								Ict.error('搜索操作出错！');
								$('#immeLocationDIV').unmask();
							}
						}).reload;
			    	}
			    },  
			    prompt:'输入手机号或姓名...'
			});  
			$('#treePanel').panel({   
				height:immeLocationMap.getSize().height-90
			});  
			$("#comDeptEmpTree").tree({
				url:'/pc/immeUserInfo/tree.htm',
				checkbox:true,
				onLoadSuccess:function(){
					$('#immeLocationDIV').unmask();
				},
				onLoadError:function(){
					Ict.error('部门树初始化失败！');
					$('#immeLocationDIV').unmask();
				},
				onClick: function(node){
					if(node&&node.iconCls=='employee'){
						var empId = node.attributes;
						if(immeLocationMap){
							var overlay = immeLocationMap.getOverlayById(empId);
							if(overlay){
								ImmeLocation.closeFailDiv();
								immeLocationMap.openOverlayTip(empId);
							}else{
								immeLocationMap.closeTip();
								if($('#'+empId)){
									var text = $('#'+empId).text();
									if(text!=''){
										$('#failinfo').html(text);
										$('#failInfoDiv').show();
									}
								}else{
									ImmeLocation.closeFailDiv();
								}
							}
						}else{
							ImmeLocation.closeFailDiv();
						}
					}
				},
				onCheck:function(node,checked){
					if(checked){
						$("#comDeptEmpTree").tree("expandAll",node.target);
						setTimeout(function(){
							var children = $("#comDeptEmpTree").tree("getChildren",node.target);
							for(var i=0;i<children.length;i++){
								console.info(children[i]);
								$("#comDeptEmpTree").tree("check",children[i].target);
							};
						},600);
					};
				}
			});
		},
		
		/**
		 * 关闭失败窗口
		 * @returns
		 */
		closeFailDiv:function(){
			$('#failinfo').html('');
			$('#failInfoDiv').hide();
		},
		
		//打开搜索输入框
		openDia:function(){
			$("#treeBar").hide();
			//var size = immeLocationMap.getSize();
			var p = $('#immeLocationMap').offset();
			var top = p.top;
			configDialog = art.dialog({
			    id: 'immeLocationDIV',
			    width:240,
			    //fixed:true,
			    height: '100%',
			    esc:false,
			    zIndex:99999999,
			    left:$(document).width()-250,
			    top:top,
			    padding:'0px',
			    opacity: 0.5,
			    title: '立即定位查询',
			    content: document.getElementById('immeLocationDIV'),
			    button:({
			        name: '立即定位',
			        focus: true,
			        callback: function () {
			        	configDialog.hide();
			        	ImmeLocation.closeFailDiv();
			        	$('body').mask("定位有一定耗时，请稍等……");//等待状态
			        	ImmeLocation.addMarker();
			        	return false;
			        }
			    }),
			    close:function(){
			    	$("#treeBar").show();
			    	return true;
			    }
			});
		},
		
		//地图初始化
		mapInit:function(lan,lat){ 
			var mapoption = new MMapOptions();
			mapoption.toolbar = MConstants.ROUND; //设置地图初始化工具条，ROUND:新版圆工具条
			mapoption.toolbarPos=new MPoint(20,20); //设置工具条在地图上的显示位置
			mapoption.overviewMap = MConstants.SHOW; //设置鹰眼地图的状态，SHOW:显示，HIDE:隐藏（默认）
			mapoption.scale = MConstants.SHOW; //设置地图初始化比例尺状态，SHOW:显示（默认），HIDE:隐藏。
			mapoption.zoom = 10;//要加载的地图的缩放级别
			mapoption.center = new MLngLat(lan,lat);//要加载的地图的中心点经纬度坐标
			mapoption.language = MConstants.MAP_CN;//设置地图类型，MAP_CN:中文地图（默认），MAP_EN:英文地图
			mapoption.fullScreenButton = MConstants.SHOW;//设置是否显示全屏按钮，SHOW:显示（默认），HIDE:隐藏
			mapoption.centerCross = MConstants.SHOW;//设置是否在地图上显示中心十字,SHOW:显示（默认），HIDE:隐藏
			mapoption.mapComButton=MConstants.SHOW_NO;
			mapoption.requestNum=100;//设置地图切片请求并发数。默认100。
			immeLocationMap = new MMap("immeLocationMap", mapoption); // 地图初始化
			
			//地图初始化完成以后打开搜索框
			immeLocationMap.addEventListener(immeLocationMap,MConstants.MAP_READY,ImmeLocation.openDia);
			immeLocationMap.addEventListener(immeLocationMap,MConstants.MAP_READY,ImmeLocation.treeInit);
		},
		//搜索函数
		addMarker:function(){
			
			var records = $("#comDeptEmpTree").tree('getChecked');
			var num = records.length;
			var ids = "";
			for(var i=0;i<num;i++){
				var idArr = records[i].id.split("_");
				if(idArr[0] == "e"){
					if(idArr[1]){
						if(i == num -1){
							ids += idArr[1];
						}else{
							ids += idArr[1]+"-";
						}
					}
				}
			}
			if(ids == ""){
				$("body").unmask();
				Ict.info("请选择定位人员");
				configDialog.show();
				return ;
			}
			
			$('#resultDiv').html('').hide();
			$.post("/pc/immeUserInfo/immeLocationInfo",{ids:ids},function(data){
				configDialog.show();
				$("body").unmask();
				if(data.success == true){
					var time = data.time;
					var all = data.all;
					var success = data.successSize;
					var fail = data.failSize;
					var html = '您于'+time+'对'+all+'人进行定位，成功：'+success+'人,失败：'+fail+'人。';
					html += '<a href="javascript:ImmeLocation.locateDetail(\''+time+'\');">查看详情</a>';
					$('#resultDiv').html(html).show();
					ImmeLocation.addAlloverLays(data.successList);
					
					var successList = data.successList;
					var failList = data.failList;
					//创建定位详情表格
					var table = '<table id="detailTable" cellpadding="2" cellspacing="1" border="1">';
					table += '<tr>'+
								'<th style="font-size:14px;font-weight:bold;background-color:#CCCCFF;width:50px;">序号</th>' +
								'<th style="font-size:14px;font-weight:bold;background-color:#CCCCFF;width:70px;text-align:left;">姓名</th>' +
								'<th style="font-size:14px;font-weight:bold;background-color:#CCCCFF;width:100px;">号码</th>' +
								'<th style="font-size:14px;font-weight:bold;background-color:#CCCCFF;width:130px;text-align:left;">部门</th>' +
								'<th style="font-size:14px;font-weight:bold;background-color:#CCCCFF;width:80px;">定位结果</th>' +
								'<th style="font-size:14px;font-weight:bold;background-color:#CCCCFF;width:240px;text-align:left;">定位结果/失败原因</th>' +
							'</tr>';
					var counter = 1;
					for ( var i in successList) {
						var imme = successList[i];
						table += '<tr>'+
									'<td style="background-color:#FFFFFF;">'+counter+'</td>' +
									'<td style="background-color:#FFFFFF;text-align:left;">'+imme.locatResult+'</td>' +
									'<td style="background-color:#FFFFFF;">'+imme.telephone+'</td>' +
									'<td style="background-color:#FFFFFF;text-align:left;">'+imme.mark1+'</td>' +
									'<td style="color:green;background-color:#FFFFFF;">成功</td>' +
									'<td style="color:green;background-color:#FFFFFF;text-align:left;">'+imme.detLocat+'</td>' +
								'</tr>';
						counter++;
					}
					
					var detailHtml = '';
					for ( var i in failList) {
						var imme = failList[i];
						table += '<tr>'+
									'<td style="background-color:#FFFFFF;">'+counter+'</td>' +
									'<td style="background-color:#FFFFFF;text-align:left;">'+imme.locatResult+'</td>' +
									'<td style="background-color:#FFFFFF;">'+imme.telephone+'</td>' +
									'<td style="background-color:#FFFFFF;text-align:left;">'+imme.mark1+'</td>' +
									'<td style="color:red;background-color:#FFFFFF;">失败</td>' +
									'<td style="color:red;background-color:#FFFFFF;text-align:left;">'+imme.detLocat+'</td>' +
								'</tr>';
						
						detailHtml += '<div id="'+imme.employeeId+'" style="display: none;">'+imme.locatResult+'&nbsp;&nbsp;'+imme.telephone+',定位失败原因：'+imme.detLocat+'</div>';
						counter++;
					}
					
					table += '</table>';
					$('#locateDetail').html(table+detailHtml);
				}else{
					Ict.error(data.msg);
				}
			});
		},
		
		/**
		 * 查看定位详情
		 * @returns
		 */
		locateDetail:function(time){
			art.dialog({
			    content: document.getElementById('locateDetail'),
			    width:'700px',
			    height:$('#detailTable').height()>400?'400px':$('#detailTable').height(),
			    opacity: 0.5,
			    title: time+'立即定位详情',
			    lock:true,
			    padding:'2px',
			    resize:false
			});
		},
		
		addAlloverLays:function(data){
			var markerArr = new Array();
			for ( var i = 0; i < data.length; i++) {
				var markerOption = new MMarkerOptions();
				var tipOption = new MTipOptions();
				immeLocationMap.removeAllOverlays();
				var fontstyle = new MFontStyle();
				fontstyle.size = 8;
				fontstyle.color = 0xFFFFFF;
				var fillstyle = new MFillStyle();
				fillstyle.color = 0x145697;
				var fontstyle1 = new MFontStyle();
				fontstyle1.size = 16;
				fontstyle1.color = 0x000000;
				var fillstyle1 = new MFillStyle();
				fillstyle1.color = 0xFFFFCC;
				var linestyle = new MLineStyle();//创建线样式对象   
				linestyle.color = 0x145697;//线的颜色，16进制整数，默认为0x005890（蓝色）   
				if (data[i].mark2 == "0") {
					tipOption.content = "<table class='table' border='0' cellpadding='0' cellspacing='1'><tr class='tr'><td class='td'>姓名</td><td class='td'>"
							+ data[i].locatResult
							+ "</td></tr><tr class='tr'><td class='td'>电话</td><td class='td'>"
							+ data[i].telephone
							+ "</td></tr><tr class='tr'><td class='td'>详细信息</td><td class='td'>"
							+ data[i].detLocat + "</td></tr></table>";
					tipOption.tipHeight = 240;
					tipOption.tipWidth = 330;
				} else {
					tipOption.content = "<table class='table' border='0' cellpadding='0'cellspacing='1'><tr class='tr'><td class='td'>店名</td><td class='td'>"
							+ data[i].locatResult
							+ "</td></tr><tr class='tr'><td class='td'>联系电话</td><td class='td'>"
							+ data[i].telephone
							+ "</td></tr><tr class='tr'><td class='td'>详细信息</td><td class='td'>"
							+ data[i].detLocat
							+ "</td></tr><tr  class='tr'><td  class='td'><input type='button' value='查看销量' onclick='test(1)'/></td><td  class='td'><input type='button' value='位置信息' onclick='test(3)' /></td></tr></table>";
					tipOption.tipHeight = 260;
					tipOption.tipWidth = 270;
				}
				tipOption.title = "详细信息";
				tipOption.titleFontStyle = fontstyle;
				tipOption.titleFillStyle = fillstyle;

				tipOption.contentFontStyle = fontstyle1;
				tipOption.fillStyle = fillstyle1;

				tipOption.borderStyle = linestyle;
				tipOption.tipType = MConstants.HTML_BUBBLE_TIP;
				//标签
				var labelOption=new MLabelOptions();//添加标注 
			    labelOption.content=data[i].locatResult;//标注的内容 
			    labelOption.hasBorder=false;//设置标注背景是否有边框，默认为false，即没有边框 
			    labelOption.hasBackground=false;//设置标注是否有背景，默认为false，即没有背景 
			    //标注左上角相对于图片中下部的锚点。Label左上角与图片中下部重合时，记为像素坐标原点(0,0)。 
			    labelOption.labelPosition=new MPoint(10,10); 
			    var labelfontstyle = new MFontStyle();
			    labelfontstyle.size = 12;
			    labelfontstyle.color = 0x9932CC;
				labelOption.fontStyle = labelfontstyle;
				
				//markerOption.imageUrl = "http://code.mapabc.com/images/lan_1.png";
				markerOption.imageUrl = basePath + 'resources/images/location_arrows.png';
				markerOption.picAgent = false;
				markerOption.tipOption = tipOption;
				markerOption.labelOption = labelOption;
				markerOption.isBounce = true;
				markerOption.canShowTip = true;
				markerOption.hasShadow = true;
				var ll = new MLngLat(data[i].longitude, data[i].latitude);
				var Mmarker = new MMarker(ll, markerOption,true);
				Mmarker.id = data[i].employeeId;
				//添加鼠标移入事件
				immeLocationMap.addEventListener(Mmarker, MConstants.MOUSE_OVER,function(param){
					immeLocationMap.openOverlayTip(param.overlayId);
				});

				markerArr.push(Mmarker);
			}
			immeLocationMap.addOverlays(markerArr, true);
		}
		
	};
}();

$(function(){
	
	 $.ajax({ 
		    async: false, 
		    type : "POST", 
		    url : "/pc/locate/manage/getCityLang", 
		    dataType : 'json', 
		    success : function(data) { 
		    	ImmeLocation.mapInit(data.lng,data.lat);
		     } 
		}); 
});