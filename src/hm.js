
HM.aggregateSeries = function(series, width, height) {
	var max_y = 1;
	var min_y = -1;

	var y_height = max_y - min_y;

	var seriesMap = [];
	var densityMap = new Uint32Array(width*height);
	for (var i = 0; i < densityMap.length; i++) { 
	    densityMap[i] = 0;
	}

	for (var x = 0; x < width; x++) {
		seriesMap[x] = {};
		var coordX = x;
		for (var j = 0; j < series.length; j++) {
			var value = series[j][x]; // TODO: check if exists and interp
			var yFract = (value - min_y) / y_height;
			var coordY = yFract * (height-1);
			if (coordY < -0.5 || coordY >= height) {
				continue;
			}
			coordY = coordY + 0.5 | 0;

			var index = coordX + coordY * width;

			// Aggregate density count
			if (!densityMap[index]) {
				densityMap[index] = 0
			}
			densityMap[index]++;

			// Aggregate series indices
			if (!seriesMap[x][coordY]) {
				seriesMap[x][coordY] = [];
			}
			seriesMap[x][coordY].push(j);
		}
	}
	HM.seriesMap = seriesMap;
	HM.densityMap = densityMap;
};

HM.getColor = function(count) {
	var maxCount = HM.maxCount;
	var gain = HM.gain;
	var sat = HM.satColor;
	var bg = HM.bgColor;
	var x = gain * count / maxCount;

	var r = Math.round(sat[0]*x - bg[0]*(x-1));
	var g = Math.round(sat[1]*x - bg[1]*(x-1));
	var b = Math.round(sat[2]*x - bg[2]*(x-1));
	var a = Math.round(255*(sat[3]*x - bg[3]*(x-1)));

	// Clamp
	r = r < 0 ? 0 : r > 255 ? 255 : r;
	g = g < 0 ? 0 : g > 255 ? 255 : g;
	b = b < 0 ? 0 : b > 255 ? 255 : b;
	a = a < 0 ? 0 : a > 255 ? 255 : a;

	return [r,g,b,a];
};

HM.getColorStrMap = {};
HM.getColorArrayMap = {};
HM.getColorArray = function(count) {
	if (HM.getColorArrayMap[count]) {
		return HM.getColorArrayMap[count];
	}
	var c = HM.getColor(count);
	HM.getColorArrayMap[count] = c;
	return c;
};

HM.getColorStr = function(count) {
	if (HM.getColorStrMap[count]) {
		return HM.getColorStrMap[count];
	}
	var c = HM.getColor(count);
	var str = 'rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]/255+')';
	HM.getColorStrMap[count] = str;
	return str;
};

HM.getSeriesAtCoords = function(x, y) {
	return HM.seriesMap[HM.xTransMap[x]][HM.yTransMap[y]];
};

HM.coordsInCanvas = function(x,y) {
	if (x < 0 || x >= HM.w) {
		return false;
	}

	if (y < 0 || y >= HM.h) {
		return false;
	}

	return true;
};

HM.mousemove = function(x,y) {
	if (HM.coordsInCanvas(x,y)) {
		var series = HM.getSeriesAtCoords(x,y);
		if (series) {
			console.log(series);
		} else {
			console.log("None");
		}
	}
};

HM.gameLoop = function(time) {

	if (time - HM.lastFrameTime > HM.maxPeriod) {
		var ctx = HM.ctx;
		var width = HM.numCols;//60;// + Math.round(100 * Math.sin(time/1000));
		var height = HM.numRows;//60;// + Math.round(100 * Math.cos(time/1000));
		var n = HM.numSeries;
		var t = time * HM.speed;

		var s;
		if (HM.funcType === "sine") {
			s = funGenerator.sine(width, n, t, HM.jitter, HM.phaseOffset / n);
		} else if (HM.funcType === "randomWalk") {
			s = funGenerator.randomWalk(width, n);
		} else if (HM.funcType === "noise") {
			s = funGenerator.noise(width, n);
		}

		HM.aggregateSeries(s, width, height);
		HM.maxCount = HM.maxRaster(HM.densityMap);
		HM.getColorStrMap = {};
		HM.getColorArrayMap = {};

		if (!HM.xTransMap || width !== HM.lastWidth || height !== HM.lastHeight) {
			HM.genTransMapping(width, height);
		}

		HM.lastWidth = width;
		HM.lastHeight = height;

		HM.setRaster(HM.densityMap, width, height);

		HM.frameRenderTime = time - HM.lastFrameTime;
		HM.lastFrameTime = time;
	}

	window.requestAnimationFrame(HM.gameLoop);
};


HM.maxRaster = function(densityMap) {
	var max = 0;
	for (var i = 0; i < densityMap.length; i++) {
		if (densityMap[i] > max) {
			max = densityMap[i];
		}
	}
	return max;
};

HM.rasterByPixel = function(img, densityMap, width, height) {
	var w = HM.w;
	var h = HM.h;
	for (var y = 0; y < h; y++) {
		yCoord = HM.yTransMap[y] * width;
		for (var x = 0; x < w; x++) {
			var i = 4*(x + y*w);
			xCoord = HM.xTransMap[x];
			v = densityMap[xCoord + yCoord];

			var c = HM.getColorArray(v);
			img[i] = c[0];
			img[i+1] = c[1];
			img[i+2] = c[2];
			img[i+3] = 255 * c[3];
		}
	}
	return img;
};

HM.rasterByCanvas = function(densityMap, width, height) {
	var w = HM.w;
	var h = HM.h;
	var ctx = HM.ctx;

	var xMap = HM.xTransInvMap;
	var yMap = HM.yTransInvMap;

	ctx.fillStyle = HM.getColorStr(0);
	ctx.fillRect(0, 0, w, h);

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var i = x + y*width;
			var v = densityMap[i];
			if (!v || v == 0) {
				continue;
			}

			ctx.fillStyle = HM.getColorStr(v);
			ctx.fillRect(xMap[x], yMap[y], xMap[x+1] - xMap[x], yMap[y+1] - yMap[y]);
		}
	}
}

HM.setRaster = function(densityMap, width, height, colorScale) {

	if (HM.renderMethod === "byPixel") {
		img = HM.imageData.data;
		img = HM.rasterByPixel(img, densityMap, width, height, colorScale);

		HM.imageData.data = img;
		HM.ctx.putImageData(HM.imageData, 0, 0);
	} else if (HM.renderMethod === "byCanvsAPI") {
		HM.rasterByCanvas(densityMap, width, height, colorScale);
	}
}

HM.closeToEven = function(width, n) {
	var widths = [];
	var dGoal = width / n;
	var error = 0;
	var last = 0;
	for (var x = 0; x < n; x++) {
		t = Math.round(last + dGoal + error);
		widths[x] = t - last;
		error = dGoal*(x+1) - t;
		last = t;
	}
	return widths;
}

HM.genTransMapping = function(width, height) {
	var w = HM.w;
	var h = HM.h;

	var xTransMap = new Uint16Array(w);
	var yTransMap = new Uint16Array(h);

	var xTransInvMap = new Uint16Array(width+1);
	var yTransInvMap = new Uint16Array(height+1);


	xTransInvMap[0] = 0;
	var widths = HM.closeToEven(w, width);
	for (var x = 0; x < width; x++) {
		for (var j = 0; j <= widths[x]; j++) {
			xTransMap[xTransInvMap[x] + j] = x; 
		}
		xTransInvMap[x+1] = xTransInvMap[x] + widths[x];
	}

	yTransInvMap[0] = 0;
	var heights = HM.closeToEven(h, height);
	for (var y = 0; y < height; y++) {
		for (var j = 0; j <= heights[y]; j++) {
			yTransMap[yTransInvMap[y] + j] = y; 
		}
		yTransInvMap[y+1] = yTransInvMap[y] + heights[y];
	}

	HM.xTransMap = xTransMap;
	HM.yTransMap = yTransMap;

	HM.xTransInvMap = xTransInvMap;
	HM.yTransInvMap = yTransInvMap;
};

