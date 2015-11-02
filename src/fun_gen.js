var funGenerator = {
	sine: function(res, n, offset, jitter, phaseSpread, timeSpread) {
		var series = [];
		for (var i = 0; i < n; i++) {
			s = [];

			for (var j = 0; j < res; j++) {
				var jit = jitter * (Math.random() - 0.5)
				var jit2 = jitter * (Math.random() - 0.5)
				var x = j / res;
				s[j] = Math.sin(x * 2 * Math.PI + offset + i*phaseSpread + jit) + jit2;
			}
			series[i] = s;
		}
		return series;
	},

	randomWalk: function(res, n) {
		var series = [];
		for (var i = 0; i < n; i++) {
			s = [0];

			for (var j = 0; j < res; j++) {
				var r = 8 / res * (Math.random() - 0.5)
				if (j == 0) {
					s[j] = r;
				} else {
					s[j] = s[j-1] + r;
				}
			}
			series[i] = s;
		}
		return series;
	},

	noise: function(res, n) {
		var series = [];
		for (var i = 0; i < n; i++) {
			s = [];

			for (var j = 0; j < res; j++) {
				var r = 2*(Math.random() - 0.5)
				s[j] = r
			}
			series[i] = s;
		}
		return series;
	}
}