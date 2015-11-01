
var sine = function(res, n, offset, jitter, phaseSpread, timeSpread) {

	var series = [];
	for (var i = 0; i < n; i++) {
		s = [];

		for (var j = 0; j < res; j++) {
			var jit = jitter * (Math.random()*0.5 - 0.5)
			var x = j / res;
			s[j] = Math.sin(x * 2 * Math.PI + offset + i*phaseSpread + jit);
		}
		series[i] = s;
	}
	return series;
};
