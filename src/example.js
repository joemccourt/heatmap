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
	HM.h = HM.canvas.height
	HM.numCols = 60;
	HM.numRows = 60;
	HM.numSeries = 8;
	HM.jitter = 0;
	HM.phaseOffset = 2*Math.PI;
	HM.gain = 1;

	HM.speed = 1/1000;
	HM.maxPeriod = 10;
	HM.lastFrameTime = 0;
	HM.funcType = 'sine';
	HM.satColor = [0, 255, 0, 1];
	HM.bgColor = [255, 0, 0, 1];
	HM.imageData = HM.ctx.getImageData(0,0,HM.w,HM.h);

	$(document).mousemove(function (e) {
		var offset = $(HM.canvasID).offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		HM.mousemove(x,y);
	});


	var gui = new dat.GUI();
	gui.add(HM, 'renderMethod', ['byPixel', 'byCanvsAPI']);
	gui.add(HM, 'numRows', 1, 120).step(1);
	gui.add(HM, 'numCols', 1, 120).step(1);
	gui.add(HM, 'numSeries', 1, 1000).step(1);

	gui.addColor(HM, 'satColor');
	gui.addColor(HM, 'bgColor');
	HM.bgColor = [0, 0, 0, 1]; //workaround


	gui.add(HM, 'speed', 0, 1/100);

	gui.add(HM, 'funcType', ['sine', 'randomWalk', 'noise']);
	gui.add(HM, 'jitter', 0, 1);
	gui.add(HM, 'phaseOffset', 0, 2*Math.PI);
	gui.add(HM, 'gain', 1, 15);


};

