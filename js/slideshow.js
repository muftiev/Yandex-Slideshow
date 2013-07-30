jQuery(document).ready(function(){

	$("div").slideshow({
		width: 500,
		height: 350
	});
	
});

jQuery.fn.slideshow = function(options) {
	Slideshowobject = inherit(Slideshow)
	Slideshowobject.init(options);
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
	}
}