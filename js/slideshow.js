jQuery(document).ready(function(){

	$("#slideshow1").slideshow({
		width: 500,
		height: 350,
		thumb_size: 75,
		thumb_hide: true,
		animated: true,
		autostart: true,
		delay: 0
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
	animated: true,
	autostart: true,
	delay: 1000,
	thumb_size: 50,
	thumb_hide: true,
	arrow_nav: true,
	key_nav: true,
	fullsize: true,
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
		var self = this;
		var html = '<div class="slideshow-wrap" style="width:'+this.width+'px; height:'+this.height+'px"></div>';
		target.html(html);
		var thumbs_wrap_size = this.thumb_size+6;
		var thumb_position = (this.thumb_hide)? thumbs_wrap_size : 0;
		var slide_wrap_size = (this.thumb_hide)? this.width : this.width-thumbs_wrap_size;		
		html = '<div class="thumbs-wrap" style="width:'+thumbs_wrap_size+'px; height:'+this.height+'px"><ul class="thumbs-list" style="width:'+thumbs_wrap_size+'px;right:-'+thumb_position+'px"></ul></div>';
		$(".slideshow-wrap").html(html);
		this.thumbs_mousewheel($(".thumbs-list"));	
		this.navigate();	
		html = '<div class="slide-wrap" style="width:'+slide_wrap_size+'px"><div class="slide-img-wrap"><div class="slide current"></div><div class="slide next"></div></div></div>';
		$(".slideshow-wrap").prepend(html);
		html = (this.arrow_nav)? '<div class="nav-wrap hidden"><a class="nav nav-left"></a><a class="nav nav-right"></a></div>' : '';
		html += (this.fullsize)? '<a class="fullsize"><img src="img/fullscreen.png" alt="fullsize"></a>' : '';
		html += (this.loader)? '<div id="loader"><img src="img/load.gif" alt="loading" /></div>' : '';
		$(".slide-wrap").append(html);
		if(!this.autostart) {
			$(".slideshow-wrap").append('<div class="start-button"><img src="img/play1.png" alt="play"></div>');
			$(document).on("click", ".start-button", function(event) {
				$(this).remove();
				$(".thumbs-list .list-item:first").click();
				if(this.delay) setTimeout(self.slideshow_autoplay, self.delay);
			}); 
		}
		$(document).on("click", ".fullsize", function(event) {
			var html = $(".slide-img-wrap").html();
			self.fullscreen(html);
		}); 
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
		var autostart = self.autostart;
		var delay = self.delay;
		$.ajax({
	        type: "GET",
	        url: url,        
	        dataType: "jsonp",
	        beforeSend: function(){
	        	if(loader) $("#loader").show();
	        },
	        success: function(data){
	            var limit = data.entries.length;
	            self.img_count = data.imageCount;
	            for(var i=0; i<limit; i++){ 
	                var data_next = (i==limit-1 ? 'data-next="'+data.links.next+'"' : '');
	                $(".thumbs-list").prepend('<li class="list-item"><a href="#?imgId='+data.entries[i].updated+'" class="list-item-link"><img class="list-item-img" style="max-width: '+thumb_size+'px" data-upd="'+data.entries[i].updated+'" data-L-src="'+data.entries[i].img.orig.href+'" '+data_next+' src="'+data.entries[i].img.XXS.href+'" alt="'+data.entries[i].title+'" /></li>');
	            }
	        },
	        complete: function(){
	            if(loader) $("#loader").hide();
	            if(!autostart) $(".start-button").show();
	            else {
	            	$(".thumbs-list .list-item:first").click();
					if(delay) setTimeout(self.slideshow_autoplay, delay);
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
	},
	thumbs_scroll: function(target){
		var prev_elem = $(".thumbs-list").find(".active");
	    prev_elem.removeClass("active");
	    var prev_index = $(".thumbs-list .list-item").index(prev_elem);
	    $(target).addClass("active");
	    var index = $(".thumbs-list .list-item").index(target);
	    var li_height = $(".list-item").outerHeight()+parseInt($(".list-item").css("margin-top"))+parseInt($(".list-item").css("margin-bottom"));
	    var ul_height = $(".thumbs-list li").length * li_height;
	    var wrapper_height = $(".thumbs-list").parent().outerHeight();
	    var slide = Math.round((index+1)*li_height-wrapper_height/2-li_height/2);
	    if(slide>0 && slide<ul_height-wrapper_height) $(".thumbs-list").animate({"top" : -slide}, 500);
	    else if(slide<ul_height-wrapper_height) $(".thumbs-list").animate({"top" : 0}, 500);
	    else $(".thumbs-list").animate({"top" : -(ul_height-wrapper_height)}, 500);

	    return (prev_index>=0) ? index-prev_index : 0;
	},
	navigate: function(){
		var self = this;
		self.nav_timeout = true;
		$(document).on("click", ".list-item", function(event){
			if(self.nav_timeout){
				self.nav_timeout = false;
				var direction = self.thumbs_scroll(this);
				var url = $(this).find("img").attr("data-l-src");
	       		var alt = $(this).find("img").attr("alt");
	       		self.show_slide(url, alt, direction);
	       	}
		}); 
		if(self.arrow_nav) {
			$(document).on("click", ".nav", function(event){
				if(self.nav_timeout){
					var activeIndex = $(".thumbs-list .list-item").index($(".thumbs-list .active"));
					if($(this).hasClass("nav-left") && (activeIndex-1>=0)) $(".thumbs-list .list-item").eq(activeIndex-1).click();
					if($(this).hasClass("nav-right") && (activeIndex+1<$(".thumbs-list .list-item").size())) $(".thumbs-list .list-item").eq(activeIndex+1).click();
					self.nav_timeout = false;
					if((activeIndex == $(".thumbs-list .list-item").size()-1) || (activeIndex==0)) setTimeout(function(){self.nav_timeout = true}, 1000);													
				}
			});
		} 
		if(self.key_nav) {
			$(document).on("keydown", function(event){
				if(self.nav_timeout){
					switch(event.keyCode){
						case 39:
							$(".nav-right").click();
							break;
						case 37:
							$(".nav-left").click();
							break;
					}				
				}
			});
		} 
	},
	show_slide: function(url, alt, direction){
		var self = this;
		var target = $(".active-img");
		var wrapper = (self.fullsize_enabled) ? $(".modal-photo-galery") : $(".slideshow-wrap");
	    if(!self.animated) {
	    	if(!direction) {
	    		$(wrapper).find(".slide.current").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
	        	setTimeout(function(){self.nav_timeout = true}, 1000);
	    	} else {
		        $(wrapper).find(".slide.next").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
		        $(wrapper).find(".slide-img").load(function() {
					$(wrapper).find(".slide.next").animate({"opacity" : 1}, 500, function(){
		                $(this).addClass("current").removeClass("next");
		                if(self.delay) setTimeout(self.slideshow_autoplay, self.delay);
		            });
		       		$(wrapper).find(".slide.current").animate({"opacity" : 0}, 500, function(){
		                $(this).empty().removeClass("current").addClass("next");
		            });
		            setTimeout(function(){self.nav_timeout = true}, 1000);
				});
			}
	        
	    } else {
	        if(!direction) {
	        	$(wrapper).find(".slide.current").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
	        	setTimeout(function(){self.nav_timeout = true}, 1000);
	        } else {
	        	var offset = self.height+self.height*0.1;
	        	if(direction>0) {		        	
		        	$(wrapper).find(".slide.next").css({"top": offset, "opacity" : 1});
		        	$(wrapper).find(".slide.next").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
		        	$(wrapper).find(".slide.next .slide-img").load(function() {
		        		$(wrapper).find(".slide.next").animate({"top" : 0}, 500, function(){
			                $(this).addClass("current").removeClass("next");
			                if(self.delay) setTimeout(self.slideshow_autoplay, self.delay);
			            });
			       		$(wrapper).find(".slide.current").animate({"top" : -offset}, 500, function(){
			                $(this).empty().removeClass("current").addClass("next");
			            });
			            setTimeout(function(){self.nav_timeout = true}, 1000);
					});
				} else {
					$(wrapper).find(".slide.next").css({"top": -offset, "opacity" : 1});
		        	$(wrapper).find(".slide.next").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
		        	$(wrapper).find(".slide.next .slide-img").load(function() {
		        		$(wrapper).find(".slide.next").animate({"top" : 0}, 500, function(){
			                $(this).addClass("current").removeClass("next");
			                if(self.delay) setTimeout(self.slideshow_autoplay, self.delay);
			            });
			       		$(wrapper).find(".slide.current").animate({"top" : offset}, 500, function(){
			                $(this).empty().removeClass("current").addClass("next");
			            });
			            setTimeout(function(){self.nav_timeout = true}, 1000);
					});
				}
	        } 
	    }
	},
	slideshow_autoplay: function(){
		$(".nav-right").click();
	},
	fullscreen: function(html){
		var self = this;
		self.fullsize_enabled = true;
		html = '<div class="slide-img-wrap">'+html+'</div>';
		var $m = $('body').modal(),
        api = $m.data('modal');
        api.opts.wrapperClass = 'modal-photo-galery';
        api.opts.width = '100%';
        api.opts.height = '100%';
        api.opts.maxWidth = '100%',
        api.opts.maxHeight = '100%',
        api.opts.closeText = '';
        api.opts.fixed = true;
        api.open(html);
        $(document).on("keydown", function(event){
			switch(event.keyCode){
				case 32:
					$(".nav-right").click();
					break;
				case 27:
					$(".modal-close").click();
					self.fullsize_enabled = false;
					$(".thumbs-list .active").click();
					break;
			}
		});
		$(document).on("click", ".modal-photo-galery .current", function(event){
			$(".nav-right").click();
		});
	}
}