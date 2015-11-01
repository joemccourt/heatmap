var HM = {};

window.onload = function() {
	HM.initSession();

	// Start loop
	window.requestAnimationFrame(HM.gameLoop);
}

HM.canvasID = "#hm";

HM.initSession = function(){
	HM.canvas = $(HM.canvasID)[0];
	HM.ctx = HM.canvas.getContext("2d");

	HM.renderMethod = "byCanvsAPI";
	// HM.renderMethod = "byPixel";

	HM.w = HM.canvas.width;
	HM.h = HM.canvas.height;
	HM.maxPeriod = 10;
	HM.lastFrameTime = 0;
	HM.imageData = HM.ctx.getImageData(0,0,HM.w,HM.h);

	$(document).mousemove(function (e) {
		var offset = $(HM.canvasID).offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		HM.mousemove(x,y);
	});
};

