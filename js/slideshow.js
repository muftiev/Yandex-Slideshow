jQuery(document).ready(function(){

	$("div").slideshow({
		width: 500,
		height: 350,
		thumb_size: 75,
		thumb_hide: false,
	});
	
});

jQuery.fn.slideshow = function(options) {
	Slideshowobject = inherit(Slideshow)
	Slideshowobject.init(options);
	Slideshowobject.construct(this);
	Slideshowobject.build_url();
	Slideshowobject.thumbs_load();
}

function inherit(proto) {
  function F() {}
  F.prototype = proto;
  return new F;
}

var Slideshow = {
	width: 500,
	height: 450,
	autostart: true,
	duration: 200,
	thumb_size: 50,
	thumb_hide: true,
	arrow_nav: true,
	key_nav: true,
	loader: true,
	username: "muftiev-rr",
	album: "357412",
	img_count: 0,

	init: function(options){
		for (var prop in options) {
			this[prop] = options[prop];
		}
	},
	construct: function(target){
		var html = '<div class="slideshow-wrap" style="width:'+this.width+'px; height:'+this.height+'px"></div>';
		target.html(html);
		var thumbs_wrap_size = this.thumb_size+6;
		var thumb_position = (this.thumb_hide)? thumbs_wrap_size : 0;
		var slide_wrap_size = (this.thumb_hide)? this.width : this.width-thumbs_wrap_size;
		html = '<div class="thumbs-wrap" style="width:'+thumbs_wrap_size+'px; height:'+this.height+'px"><ul class="thumbs-list" style="width:'+thumbs_wrap_size+'px;right:-'+thumb_position+'px"></ul></div>';
		$(".slideshow-wrap").html(html);
		this.thumbs_mousewheel($(".thumbs-list"));		
		html = '<div class="slide-wrap" style="width:'+slide_wrap_size+'px"><div class="slide-img-wrap"></div></div>';
		$(".slideshow-wrap").prepend(html);
		html = (this.loader)? '<div id="loader"><img src="img/load.gif" alt="loading" /></div>' : '';
		$(".slide-wrap").append(html);
	},
	build_url: function(){
		var username = this.username;
		var album = this.album;
		var password = this.password;
		this.url = (username.length)? "http://api-fotki.yandex.ru/api/users/"+username : this.url;
		this.url += (album.length)? "/album/"+album : "";
		this.url += "/photos/?format=json";
	},
	thumbs_load: function(){
		var self = this;
		var url = self.url;
		var limit = (self.img_count)? self.img_count - $(".thumbs-list").find(".list-item").length : 30;
		limit = (limit>30)? 30 : limit;
		url += "&limit="+limit;
		var loader = self.loader;
		var thumb_size = self.thumb_size;
		$.ajax({
	        type: "GET",
	        url: url,        
	        dataType: "jsonp",
	        beforeSend: function(){
	        	if(loader){
	            	$("#loader").show();
	            }
	        },
	        success: function(data){
	            var limit = data.entries.length;
	            self.img_count = data.imageCount;
	            for(var i=0; i<limit; i++){ 
	                var data_next = (i==limit-1 ? 'data-next="'+data.links.next+'"' : '');
	                $(".thumbs-list").prepend('<li class="list-item"><a href="#?imgId='+data.entries[i].updated+'" class="list-item-link"><img class="list-item-img" style="max-width: '+thumb_size+'px" data-upd="'+data.entries[i].updated+'" data-L-src="'+data.entries[i].img.L.href+'" '+data_next+' src="'+data.entries[i].img.XXS.href+'" alt="'+data.entries[i].title+'" /></li>');
	            }
	        },
	        complete: function(){
	            if(loader){
	            	$("#loader").hide();
	            }
	        }
	    });
	},
	thumbs_mousewheel: function(target){
		var self = this;
		target.mousewheel(function(event, delta, height){
			var position = parseInt($(this).css("top"));
	        var height = parseInt($(this).height()) - parseInt($(this).parent().height());
	        if(height>0){
		        var slide = parseInt($(this).parent().outerHeight())*0.8;
		        if(position+slide*delta>0) slide = 0-position;
		        if(position+slide*delta<-height) slide = height+position;
		        if((position+slide*delta*2<-height) && (position+slide*delta>-height) && ($(".thumbs-list").find(".list-item").length<self.img_count)) {
		            var next = $(this).children().last().find("img").attr("data-next");
		            if(next!=="undefined") self.thumbs_load(next);
		        }
		        $(this).stop().animate({"top" : position+slide*delta}, 500);
		    }
		});		
	}
}