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
	autostart: false,
	delay: 0,				
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
		var self = this,
			wrapper = $(target),
			height = self.height,
			width = self.width,
			thumb_hide = self.thumb_hide,
			thumbs_wrap_size = self.thumb_size+6,
			thumb_position = (thumb_hide)? thumbs_wrap_size : 0,
			slide_wrap_size = (thumb_hide)? width : width-thumbs_wrap_size,
			delay = self.delay;

		delay = (delay && delay<1000) ? 1000 : delay;	
		self.delay = delay;
		self.wrapper = wrapper;

		var slideshow_wrap = $("<div/>")
			.addClass("slideshow-wrap")
			.css({
				"width" : width,
				"height" : height
			}).appendTo(wrapper);

		var thumbs_wrap = $("<div/>")
			.addClass("thumbs-wrap")
			.css({
				"width" : thumbs_wrap_size,
				"height" : height
			}).appendTo(slideshow_wrap);

		var thumbs_list = $("<ul/>")
			.addClass("thumbs-list")
			.css({
				"width" : thumbs_wrap_size,
				"right" : -thumb_position
			}).appendTo(thumbs_wrap);

		self.thumbs_mousewheel(thumbs_list);	
		var slide_wrap = $("<div/>")
			.addClass("slide-wrap")
			.css("width", slide_wrap_size)
			.prependTo(slideshow_wrap);

		var slide_img_wrap = $("<div/>")
			.addClass("slide-img-wrap")
			.appendTo(slide_wrap);

		$("<div/>")
			.addClass("slide current")
			.appendTo(slide_img_wrap);

		$("<div/>")
			.addClass("slide next")
			.appendTo(slide_img_wrap);

		var nav_wrap = $("<div/>")
			.addClass("nav-wrap hidden")
			.appendTo(slide_wrap);

		$("<a/>")
			.addClass("nav nav-left")
			.appendTo(nav_wrap);

		$("<a/>")
			.addClass("nav nav-right")
			.appendTo(nav_wrap);

		if(self.fullsize){
			var fullsize = $("<a/>")
				.addClass("fullsize")
				.appendTo(slide_wrap);

			$("<img/>")
				.attr("src", "img/fullscreen.png")
				.attr("alt", "fullsize")
				.appendTo(fullsize);
		}
		if(self.loader){
			var loader = $("<div/>")
				.attr("id", "loader")
				.appendTo(slide_wrap);

			$("<img/>")
				.attr("src", "img/load.gif")
				.attr("alt", "loading")
				.appendTo(loader);
		}

		if(!self.autostart) {
			var start_button = $("<div/>")
				.addClass("start-button")
				.appendTo(slideshow_wrap);

			$("<img/>")
				.attr("src", "img/play.png")
				.attr("alt", "play")
				.appendTo(start_button);

			$(start_button).on("click", function(event) {	
				$(this).remove();
				var start_elem = thumbs_list.find(".list-item:first"),
					url = start_elem.find("img").attr("data-l-src"),
	       			alt = start_elem.find("img").attr("alt");

	       		start_elem.addClass("active");
	       		self.show_slide(url, alt, 0); 		
				if(delay) self.autoplay_intID = setInterval(function(){ self.slideshow_autoplay() }, delay);
			}); 
		}
		$(fullsize).on("click", function(event) {	
			var html = $(slide_img_wrap).html();

			self.fullscreen(html);
		}); 
		
	},

	build_url: function(){
		var username = this.username,
			album = this.album,
			password = this.password,
			url = this.url;

		url = (username.length)? "http://api-fotki.yandex.ru/api/users/"+username : url;
		url += (album.length)? "/album/"+album : "";
		url += "/photos/rupdated/?format=json";
		this.url = url;
	},
	thumbs_load: function(){
		var self = this,
			wrapper = self.wrapper,
			thumbs_list = wrapper.find(".thumbs-list"),
			next_img = self.next_img,
			url = (next_img)? next_img : self.url,
			thumb_size = self.thumb_size,
			max_limit = Math.round(self.height*2/thumb_size),
			img_count = self.img_count,
			limit = (img_count)? img_count - thumbs_list.find(".list-item").length : max_limit,
			loader = self.loader,
			loader_elem = wrapper.find("#loader"),
			thumb_size = self.thumb_size,
			autostart = self.autostart,
			delay = self.delay,
			first_load = (next_img)? false : true;

		limit = (limit>max_limit)? max_limit : limit;	
		url += (next_img)? "" : "&limit="+limit;
		self.scroll_lock = true;
		$.ajax({
	        type: "GET",
	        url: url,        
	        dataType: "jsonp",
	        beforeSend: function(){
	        	if(loader && first_load) loader_elem.show();	
	        },
	        success: function(data){
	            var limit = data.entries.length;

	            self.img_count = data.imageCount;	
	            for(var i=0; i<limit; i++){ 
	                var data_next = data.links.next;	

	                self.next_img = (data_next === undefined)? false : data_next;	

	                var list_item = $("<li/>")
	                	.addClass("list-item")
	                	.appendTo(thumbs_list);
	                var list_item_link = $("<a/>")
	                	.attr("href", "#")
	                	.addClass("list-item-link")
	                	.appendTo(list_item);
	                $("<img/>")
	                	.attr("src", data.entries[i].img.XXS.href)
	                	.attr("alt", data.entries[i].title)
	                	.attr("data-L-src", data.entries[i].img.orig.href)
	                	.addClass("list-item-img")
	                	.css("max-width", thumb_size)
	                	.appendTo(list_item_link);
	            }
	        },
	        complete: function(){
	        	self.navigate();
	        	if(first_load) {	        		
		            if(loader) loader_elem.hide();		
		            if(!autostart) wrapper.find(".start-button").show();
		            else {
		            	var start_elem = thumbs_list.find(".list-item:first"),
							url = start_elem.find("img").attr("data-l-src"),
			       			alt = start_elem.find("img").attr("alt");

			       		start_elem.addClass("active");
			       		self.show_slide(url, alt, 0); 		
						if(delay) self.autoplay_intID = setInterval(function(){ self.slideshow_autoplay() }, delay);
		            }
	        	}
	        	self.scroll_lock = false;	        		        		            
	        }
	    });
	},
	thumbs_mousewheel: function(target){
		var self = this,		
			wrapper = self.wrapper;		

		target.mousewheel(function(event, delta, height){
			var img_count = self.img_count,
				next_img = self.next_img;

			delta = delta/Math.abs(delta);
			if(!self.scroll_lock){
				var position = parseInt($(this).css("top")),
		        	height = parseInt($(this).height()) - parseInt($(this).parent().height());

		        if(height>0){
			        var slide = parseInt($(this).parent().outerHeight())*0.6;

			        if(position+slide*delta>0) slide = 0-position;
			        if(position+slide*delta<-height) slide = height+position;
			        if((position+slide*delta*2<-height) && (position+slide*delta>-height) && (wrapper.find(".thumbs-list .list-item").length<img_count)) {
			        	if(($(this).children().length<img_count) && (next_img!=false)) self.thumbs_load();
			        }
			        $(this).stop().animate({"top" : position+slide*delta}, 500);
			    }	
			}			
		});		
	},
	thumbs_scroll: function(target){
		var self = this,
			wrapper = self.wrapper,
			thumbs_list = wrapper.find(".thumbs-list"),
			list_item = thumbs_list.find(".list-item"),
			prev_elem = thumbs_list.find(".active"),
			prev_index = list_item.index(prev_elem),
			index = list_item.index(target),
			li_height = list_item.outerHeight()+parseInt(list_item.css("margin-top"))+parseInt(list_item.css("margin-bottom")),
		    ul_height = list_item.length * li_height,
		    wrapper_height = thumbs_list.parent().outerHeight(),
		    slide = Math.round((index+1)*li_height-wrapper_height/2-li_height/2);

	    prev_elem.removeClass("active");
	    $(target).addClass("active");
	    if(list_item.length-index<Math.round(self.height/self.thumb_size)){
	    	if(self.next_img!=false) self.thumbs_load();
	    }	    
	    if(slide>0 && slide<ul_height-wrapper_height) thumbs_list.animate({"top" : -slide}, 500);
	    else if(slide<ul_height-wrapper_height) thumbs_list.animate({"top" : 0}, 500);
	    else thumbs_list.animate({"top" : -(ul_height-wrapper_height)}, 500);

	    return (prev_index>=0) ? index-prev_index : 0;
	},
	navigate: function(){
		var self = this,
			wrapper = self.wrapper,
			delay = self.delay;			

		wrapper.find(".thumbs-list .list-item").on("click", function(event){
			var d = $.when(self.d_cur, self.d_next);

			if(d.state() == "resolved"){
				if(delay){
					clearInterval(self.autoplay_intID);
					self.autoplay_intID = setInterval(function(){ self.slideshow_autoplay() }, delay);
				}				
				var direction = self.thumbs_scroll(this),
					url = $(this).find("img").attr("data-l-src"),
	       			alt = $(this).find("img").attr("alt");

	       		self.show_slide(url, alt, direction);
			}
		}); 
		wrapper.find(".nav").on("click", function(event){
			var thumbs_list = wrapper.find(".thumbs-list"),
				list_item = thumbs_list.find(".list-item"),
				activeIndex = list_item.index(thumbs_list.find(".active"));

			if($(this).hasClass("nav-left") && (activeIndex-1>=0)) list_item.eq(activeIndex-1).click();
			if($(this).hasClass("nav-right") && (activeIndex+1<list_item.size())) list_item.eq(activeIndex+1).click();
		});
	},
	show_slide: function(url, alt, direction){
		var self = this,
			wrapper = self.wrapper,
			target = wrapper.find(".active-img"),
			fullsize_enabled = self.fullsize_enabled,
			d_cur = $.Deferred(),
			d_next = $.Deferred();

		wrapper = (fullsize_enabled) ? $(".modal-photo-galery") : wrapper.find(".slideshow-wrap");

		var slide_next = wrapper.find(".slide.next"),
        	slide_current = wrapper.find(".slide.current"),
        	slide_img = $("<img/>")
    			.attr("src", url)
    			.attr("alt", alt)
    			.addClass("slide-img");

	    if(!self.animated) {
	    	if(!direction) {
	       		slide_current.html(slide_img);
	    		slide_img.load(function() {
					d_cur.resolve();
					d_next.resolve();
				});
	    	} else {
	    		slide_next.html(slide_img);
		       	slide_img.load(function() {
					slide_next.animate({"opacity" : 1}, 500, function(){
		                $(this).addClass("current").removeClass("next");
		                d_next.resolve();
		            });
		       		slide_current.animate({"opacity" : 0}, 500, function(){
		                $(this).empty().removeClass("current").addClass("next");
		                d_cur.resolve();
		            });
				});
			}
	        
	    } else {
	    	if(!direction) {
	        	slide_current.html(slide_img);
	        	slide_img.load(function() {
					d_cur.resolve();
					d_next.resolve();
				});
	        } else {
	        	var height = self.height,
	        	offset = (fullsize_enabled) ? $(".modal-photo-galery").height()+$(".modal-photo-galery").height()*0.1 : height+height*0.1;
	        	if(direction>0) {
	        		slide_next.css({"top": offset, "opacity" : 1});
		        	slide_next.html(slide_img);
		        	slide_img.load(function() {
		        		slide_next.animate({"top" : 0}, 500, function(){
			                $(this).addClass("current").removeClass("next");
			                d_next.resolve();
			            });
			       		slide_current.animate({"top" : -offset}, 500, function(){
			                $(this).empty().removeClass("current").addClass("next");
			                d_cur.resolve();
			            });
					});
				} else {
					slide_next.css({"top": -offset, "opacity" : 1});
		        	slide_next.html(slide_img);
		        	slide_img.load(function() {
		        		slide_next.animate({"top" : 0}, 500, function(){
			                $(this).addClass("current").removeClass("next");
			                d_next.resolve();
			            });
			       		slide_current.animate({"top" : offset}, 500, function(){
			                $(this).empty().removeClass("current").addClass("next");
			                d_cur.resolve();
			            });
					});
				}
	        } 
	    }
	    self.d_cur = d_cur.promise();
	    self.d_next = d_next.promise();
	},
	slideshow_autoplay: function(){
		var self = this,
			wrapper = self.wrapper,
			thumbs_list = wrapper.find(".thumbs-list"),
			list_item = thumbs_list.find(".list-item"),
			activeIndex = list_item.index(thumbs_list.find(".active"));

		if(activeIndex < self.img_count-1){
			var next = list_item.eq(activeIndex+1),
				d = $.when(self.d_cur, self.d_next);

			if(d.state() == "resolved"){
				var direction = self.thumbs_scroll(next),
					url = next.find("img").attr("data-l-src"),
	       			alt = next.find("img").attr("alt");		       			
	       		self.show_slide(url, alt, direction);
			}
		} else {
			clearInterval(self.autoplay_intID);
		}
	},
	fullscreen: function(html){
		var self = this,
			wrapper = self.wrapper,
			nav_left = wrapper.find(".nav-left"),
			nav_right = wrapper.find(".nav-right"),		
			m = $('body').modal(),
	        api = m.data('modal');

        api.opts.wrapperClass = 'modal-photo-galery';
        api.opts.width = '100%';
        api.opts.height = '100%';
        api.opts.maxWidth = '100%';
        api.opts.maxHeight = '100%';
        api.opts.closeText = '';
        api.opts.fixed = true;
        self.fullsize_enabled = true;
		slide = $("<div/>")
			.addClass("slide-img-wrap")
			.append(html);

        api.open(slide);	

        $(document).on("keydown", function(event){		
        	if(self.fullsize_enabled) {
				switch(event.keyCode){
					case 27: 				
						self.fullsize_enabled = false;
						wrapper.find(".thumbs-list .active").click();
						$(".modal-close").click();
						break;
					case 32: 				
						nav_right.click();
						break;					
					case 39: 				
						nav_right.click();
						break;
					case 37: 				
						nav_left.click();
						break;
				}
			}
		});
		$(document).on("click", ".modal-photo-galery .current", function(event){
			if(self.fullsize_enabled) nav_right.click();
		});
	}
}