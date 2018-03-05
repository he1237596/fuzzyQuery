
;(function(jQuery){
//	String.prototype.trim = function()
//	{
//	    return this.replace(/(^\s*)|(\s*$)/g, "");
//	}
	var fuzzySearch = function(opt,config){

		var self = this;
		this.opt = opt;
		this.config = config || {};
		//默认配置参数
		this.setting={
			width: 500,//input和单个列表项的宽度
			height: 50,//单个列表项的高度,input高度固定
			fill: true,//项点击后是否填充input
			callback: function(){},//点击后的回调
			url: "",//请求的url
			method: "get",//请求方法
			params: {},//请求额外参数
			searchName:"",//input搜索字段名
			async: true,//是否异步
			dataType: "json",//数据格式
			successCallback: function(res){},//请求成功自定义回调扩展
			errorCallback: function(res){},//请求失败回调
			msg: []//本地查询数据
		}
		//inportText元素
		this.parentEle = this.opt.parent();
		//配置参数优先级:元素配置>初始化配置>默认配置
		$.extend(this.setting,this.config,this.getSetting());
		//初始化元素
		this.initHtml();
		//设置样式
		this.setStyle();
		//结果列表item
		this.items = this.opt.next();
//		this.displayResult();
		//输入事件
		this.opt.on("keyup click",function(e) {
	        e.stopPropagation();
	        //设置弹出框位置
	        var flag = $(this).offset().top - $(document).scrollTop() - ($(window).height() - $(this).height()) / 2;
	        if(flag>0){
	            self.items.addClass("filter-items-top").removeClass("filter-items-bot");
	        }else{
	            self.items.addClass("filter-items-bot").removeClass("filter-items-top");
	        }
	        if (self.opt.val().length <= 0) {
	            self.items.hide(); //如果什么都没填，跳出
	            return;
	        }
	//      $(this).parent().siblings(".resetSearch").show();
			var val = $(this).val().replace(/(^\s*)|(\s*$)/g, "");
			var _msg = self.setting.msg;
			if(_msg.length>0){//静态数据模糊查询
				//dom添加查询结果面板
				self.displayResult(_msg);
				self.items.children(".filter-item").hide(); //如果填了，先将所有的选项隐藏
		        var num=0;
		        for (var i = 0; i < _msg.length; i++) {
		        	//只要输入就显示列表框
		            self.items.show(); 
		            //模糊匹配，将所有匹配项显示
					console.log(self.items.children(".filter-item").eq(i).text())
		            if (self.items.children(".filter-item").eq(i).text().toLowerCase().indexOf(val.toLowerCase()) >= 0) {
		                num++;
		                self.items.children(".filter-item").eq(i).show();
		                $('.Nothing').hide();
		            }
		        }
		        if(num==0){
		            $('.Nothing').show();
		        }
			}else if(_msg.length==0 && self.setting.url && val.length>0){
				//动态请求后台数据
				var params = self.setting.params;
				params[self.setting.searchName] = val;
				self.ajax(self.setting.url,params, self.setting.successCallback, self.setting.errorCallback, self.setting.async, self.setting.dataType, self.setting.method);
			}

   });
//  	this.items.on("mouseenter",".filter-item",function(){
//			
//		}).on("mouseleave",".filter-item",function(){
//
//		})
    	//项点击事件
		this.items.on("click",".filter-item",function(){
			var data = $(this).data("item");
			self.opt.val("");
			if(self.setting.fill == true){
				self.opt.val(data.name);
			}
			self.items.hide();
			self.setting.callback(data);
		});
		//无匹配项点击
		this.items.children(".Nothing").on("click",function(){
			    var event = event? event: window.event;
			    var srcObj = ((event.srcElement)?event.srcElement:event.target);
			    $('.Nothing').hide();
			    self.items.hide();
		})
	};
	
	fuzzySearch.prototype = {
		ajax: function(url, data, successCallback, errorCallback, async, dataType, method) {
			var _this_ = this;
			$.ajax({
				type : method,
				url : url,
				async : async,
				data : data,
				dataType : dataType,
				contentType : "application/json",
				success : function(response) {
					//动态请求数据的结果(PS:不会后台接口,YY已经请求到数据关键字查询的数据)
//					var msg = response.list;
					var msg = [{name:"讲师001",section:"事业部A",type:"讲师"},{name:"助教002",section:"事业部B",type:"助教"},{name:"助教003",section:"事业部C",type:"助教"},{name:"助教004",section:"事业部D",type:"助教"},{name:"助教005",section:"宣传部A",type:"助教"},{name:"讲师006",section:"宣传部B",type:"讲师"},{name:"讲师007",section:"市场部A",type:"讲师"},{name:"讲师008",section:"市场部B",type:"讲师"},{name:"讲师009",section:"市场部C",type:"讲师"},{name:"助教010",section:"市场部F",type:"助教"}];
					_this_.displayResult(msg);
					_this_.items.show();
					if(msg.length<=0){
			            $('.Nothing').show();
			        }else{
//			        	_this_.items.children(".filter-item").show();
			        }
						successCallback(response);
				},
				error : function(response) {
						errorCallback(response);
				}
			});
		},
		initHtml: function(){
			this.opt.wrap("<div class='filter-wrap' id='filter-wrap-"+this.opt.attr("id")+"'></div>");
			this.opt.after("<div style=\"width:" + this.setting.width + ";\" class='filter-items' id='filter_" + this.opt.attr("id") + "' data-i='"+this.setting.width+"'></div>");
    	},
		displayResult: function(data){
			var _self = this;
			//生成html列表元素,需要自定义传入对应参数,读者可重写自定义面板
			var html = "";
			    $.each(data , function (i, n) {
		        var section = n.section || "";
		        var thisOne = JSON.stringify(n);
			    html += "<div class=\"filter-item\" data-item='"+thisOne+"'><div class=\"hs-memberList clearfix\"><div class=\"fl\"><img src=\"./courseImg.jpg\"></div><div class=\"fl\"><div class=\"hs-memberName\">"+ n.name +"</div><div class=\"hs-section\">"+section+"</div></div></div></div>";
    			});
            $("#filter_" + _self.opt.attr("id")).html(html);
    		$("#filter_" + _self.opt.attr("id")).append("<div class=\"Nothing\">无匹配项</div>");

		},
		setStyle: function(){
			this.opt.css({
				width: this.setting.width + "px",
				
			});
			this.parentEle.css({
				width: this.setting.width + "px",
				height: this.setting.height + "px"
			});
			this.opt.next().css({
				width: this.setting.width + "px"
			});
		},
		getSetting: function(){
			var setting = this.parentEle.attr("data-setting");
			if(setting&&setting != ""){
				return JSON.parse(setting);
				
			}else{
				return {};
			}
		}
	};
	fuzzySearch.init = function(config){
		var _this = this;
//		opts.each(function(i,elem){
//			new _this(elem);
//		});

		$(config.className).each(function(){
			new _this($(this),config);
		});
		$("body").on("click",function() {
	        $(".filter-items").hide();
		});

	}
	window["fuzzySearch"] = fuzzySearch;

})(jQuery);
