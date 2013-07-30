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
	password: "",
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
		html = '<div class="slide-wrap" style="width:'+slide_wrap_size+'px"><div class="slide-img-wrap"></div></div>';
		$(".slideshow-wrap").prepend(html);
	}
}