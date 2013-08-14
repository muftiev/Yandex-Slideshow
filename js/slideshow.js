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

	$("#slideshow2").slideshow({
		width: 500,
		height: 350,
		thumb_size: 50,
		thumb_hide: true,
		animated: false,
		autostart: false,
		delay: 3000,
		album: "356243",
		fullsize: true,
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
	fullsize: true,
	loader: true,
	username: "muftiev-rr",
	album: "357412",
	img_count: 0,
	next_img: false,
	scroll_lock: false,

	init: function(options){
		for (var prop in options) {
			this[prop] = options[prop];
		}
	},
	construct: function(target){
		var self = this;
		self.wrapper = target;
		var html = '<div class="slideshow-wrap" style="width:'+this.width+'px; height:'+this.height+'px"></div>';
		$(self.wrapper).html(html);
		var thumbs_wrap_size = self.thumb_size+6;
		var thumb_position = (self.thumb_hide)? thumbs_wrap_size : 0;
		var slide_wrap_size = (self.thumb_hide)? self.width : self.width-thumbs_wrap_size;		
		html = '<div class="thumbs-wrap" style="width:'+thumbs_wrap_size+'px; height:'+self.height+'px"><ul class="thumbs-list" style="width:'+thumbs_wrap_size+'px;right:-'+thumb_position+'px"></ul></div>';
		$(self.wrapper).find(".slideshow-wrap").html(html);
		self.thumbs_mousewheel($(self.wrapper).find(".thumbs-list"));	
		html = '<div class="slide-wrap" style="width:'+slide_wrap_size+'px"><div class="slide-img-wrap"><div class="slide current"></div><div class="slide next"></div></div></div>';
		$(self.wrapper).find(".slideshow-wrap").prepend(html);
		html = '<div class="nav-wrap hidden"><a class="nav nav-left"></a><a class="nav nav-right"></a></div>';
		html += (self.fullsize)? '<a class="fullsize"><img src="img/fullscreen.png" alt="fullsize"></a>' : '';
		html += (self.loader)? '<div id="loader"><img src="img/load.gif" alt="loading" /></div>' : '';
		$(self.wrapper).find(".slide-wrap").append(html);
		if(!self.autostart) {
			$(self.wrapper).find(".slideshow-wrap").append('<div class="start-button"><img src="img/play1.png" alt="play"></div>');
			$(self.wrapper).find(".start-button").on("click", function(event) {
				$(this).remove();
				$(self.wrapper).find(".thumbs-list .list-item:first").click();
				if(self.delay) setTimeout(function() { self.slideshow_autoplay() }, self.delay);
			}); 
		}
		$(self.wrapper).find(".fullsize").on("click", function(event) {
			var html = $(self.wrapper).find(".slide-img-wrap").html();
			self.fullscreen(html);
		}); 
		self.delay = (self.delay && self.delay<1000) ? 1000 : self.delay;
	},
	build_url: function(){
		var username = this.username;
		var album = this.album;
		var password = this.password;
		this.url = (username.length)? "http://api-fotki.yandex.ru/api/users/"+username : this.url;
		this.url += (album.length)? "/album/"+album : "";
		this.url += "/photos/rupdated/?format=json";
	},
	thumbs_load: function(){
		var self = this;
		var url = (self.next_img)? self.next_img : self.url;
		var max_limit = Math.round(self.height*2/self.thumb_size);
		var limit = (self.img_count)? self.img_count - $(self.wrapper).find(".thumbs-list").find(".list-item").length : max_limit;
		limit = (limit>max_limit)? max_limit : limit;
		url += (self.next_img)? "" : "&limit="+limit;
		var loader = self.loader;
		var thumb_size = self.thumb_size;
		var autostart = self.autostart;
		var delay = self.delay;
		var first_load = (self.next_img)? false : true;
		self.scroll_lock = true;
		$.ajax({
	        type: "GET",
	        url: url,        
	        dataType: "jsonp",
	        beforeSend: function(){
	        	if(loader) $(self.wrapper).find("#loader").show();
	        },
	        success: function(data){
	            var limit = data.entries.length;
	            self.img_count = data.imageCount;
	            for(var i=0; i<limit; i++){ 
	                var data_next = 'data-next="'+data.links.next+'"';
	                data_next = (data_next === undefined)? "" : data_next;
	                $(self.wrapper).find(".thumbs-list").append('<li class="list-item"><a href="#" class="list-item-link"><img class="list-item-img" style="max-width: '+thumb_size+'px" data-L-src="'+data.entries[i].img.orig.href+'" '+data_next+' src="'+data.entries[i].img.XXS.href+'" alt="'+data.entries[i].title+'" /></li>');
	            }
	        },
	        complete: function(){
	        	if(first_load) {
	        		self.navigate();
		            if(loader) $(self.wrapper).find("#loader").hide();
		            if(!autostart) $(self.wrapper).find(".start-button").show();
		            else {
		            	$(self.wrapper).find(".thumbs-list .list-item:first").click();
						if(delay) setTimeout(function() { self.slideshow_autoplay() }, self.delay);
		            }
	        	}
	        	self.scroll_lock = false;	        		        		            
	        }
	    });
	},
	thumbs_mousewheel: function(target){
		var self = this;
		target.mousewheel(function(event, delta, height){
			if(!self.scroll_lock){
				var position = parseInt($(this).css("top"));
		        var height = parseInt($(this).height()) - parseInt($(this).parent().height());
		        if(height>0){
			        var slide = parseInt($(this).parent().outerHeight())*0.6;
			        if(position+slide*delta>0) slide = 0-position;
			        if(position+slide*delta<-height) slide = height+position;
			        if((position+slide*delta*2<-height) && (position+slide*delta>-height) && ($(self.wraper).find(".thumbs-list").find(".list-item").length<self.img_count)) {
			        	if($(this).children().length<self.img_count){
			        		var next = $(this).children().last().find("img").attr("data-next");
				            if(next!=="undefined") self.next_img = next;
				            self.thumbs_load();
			        	}		            
			        }
			        $(this).stop().animate({"top" : position+slide*delta}, 500);
			    }	
			}			
		});		
	},
	thumbs_scroll: function(target){
		var self = this;
		var prev_elem = $(self.wrapper).find(".thumbs-list").find(".active");
	    prev_elem.removeClass("active");
	    var prev_index = $(self.wrapper).find(".thumbs-list .list-item").index(prev_elem);
	    $(target).addClass("active");
	    var index = $(self.wrapper).find(".thumbs-list .list-item").index(target);
	    var li_height = $(self.wrapper).find(".list-item").outerHeight()+parseInt($(self.wrapper).find(".list-item").css("margin-top"))+parseInt($(self.wrapper).find(".list-item").css("margin-bottom"));
	    var ul_height = $(self.wrapper).find(".thumbs-list li").length * li_height;
	    var wrapper_height = $(self.wrapper).find(".thumbs-list").parent().outerHeight();
	    var slide = Math.round((index+1)*li_height-wrapper_height/2-li_height/2);
	    if(slide>0 && slide<ul_height-wrapper_height) $(self.wrapper).find(".thumbs-list").animate({"top" : -slide}, 500);
	    else if(slide<ul_height-wrapper_height) $(self.wrapper).find(".thumbs-list").animate({"top" : 0}, 500);
	    else $(self.wrapper).find(".thumbs-list").animate({"top" : -(ul_height-wrapper_height)}, 500);

	    return (prev_index>=0) ? index-prev_index : 0;
	},
	navigate: function(){
		var self = this;
		self.nav_timeout = true;
		$(self.wrapper).find(".list-item").on("click", function(event){
			if(self.nav_timeout){
				self.nav_timeout = false;
				var direction = self.thumbs_scroll(this);
				var url = $(this).find("img").attr("data-l-src");
	       		var alt = $(this).find("img").attr("alt");
	       		self.show_slide(url, alt, direction);
	       	}
		}); 
		$(self.wrapper).find(".nav").on("click", function(event){
			if(self.nav_timeout){
				var activeIndex = $(self.wrapper).find(".thumbs-list .list-item").index($(self.wrapper).find(".thumbs-list .active"));
				if($(this).hasClass("nav-left") && (activeIndex-1>=0)) $(self.wrapper).find(".thumbs-list .list-item").eq(activeIndex-1).click();
				if($(this).hasClass("nav-right") && (activeIndex+1<$(self.wrapper).find(".thumbs-list .list-item").size())) $(self.wrapper).find(".thumbs-list .list-item").eq(activeIndex+1).click();
				self.nav_timeout = false;
				if((activeIndex == $(self.wrapper).find(".thumbs-list .list-item").size()-1) || (activeIndex==0)) setTimeout(function(){self.nav_timeout = true}, 1000);													
			}
		});
	},
	show_slide: function(url, alt, direction){
		var self = this;
		var target = $(self.wrapper).find(".active-img");
		var wrapper = (self.fullsize_enabled) ? $(".modal-photo-galery") : $(self.wrapper).find(".slideshow-wrap");
	    if(!self.animated) {
	    	if(!direction) {
	    		$(wrapper).find(".slide.current").html('<img class="slide-img" src="'+url+'" alt="'+alt+'" />');
	        	setTimeout(function(){self.nav_timeout = true}, 1000);
	    	} else {
		        $(wrapper).find(".slide.next").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
		        $(wrapper).find(".slide-img").load(function() {
					$(wrapper).find(".slide.next").animate({"opacity" : 1}, 500, function(){
		                $(this).addClass("current").removeClass("next");
		                if(self.delay) setTimeout(function() { self.slideshow_autoplay() }, self.delay);
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
	        	var offset = (self.fullsize_enabled) ? $(".modal-photo-galery").height()+$(".modal-photo-galery").height()*0.1 : self.height+self.height*0.1;
	        	if(direction>0) {		        	
		        	$(wrapper).find(".slide.next").css({"top": offset, "opacity" : 1});
		        	$(wrapper).find(".slide.next").html('<img id="srcimg" class="slide-img" src="'+url+'" alt="'+alt+'" />');
		        	$(wrapper).find(".slide.next .slide-img").load(function() {
		        		$(wrapper).find(".slide.next").animate({"top" : 0}, 500, function(){
			                $(this).addClass("current").removeClass("next");
			                if(self.delay) setTimeout(function() { self.slideshow_autoplay() }, self.delay);
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
			                if(self.delay) setTimeout(function() { self.slideshow_autoplay() }, self.delay);
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
		$(this.wrapper).find(".nav-right").click();
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
        	if(self.fullsize_enabled) {
				switch(event.keyCode){
					case 32:
						$(self.wrapper).find(".nav-right").click();
						break;
					case 27:
						self.fullsize_enabled = false;
						self.nav_timeout = true;
						$(self.wrapper).find(".thumbs-list .active").click();
						$(".modal-close").click();
						break;
					case 39:
						$(self.wrapper).find(".nav-right").click();
						break;
					case 37:
						$(self.wrapper).find(".nav-left").click();
						break;
				}
			}
		});
		$(document).on("click", ".modal-photo-galery .current", function(event){
			if(self.fullsize_enabled) $(self.wrapper).find(".nav-right").click();
		});
	}
}