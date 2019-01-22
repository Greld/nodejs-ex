
var lat = 49.1718178, lon = 16.5990164, zoom = 10;
var W, L;
var position;
setPosition(lat, lon);

function setPosition(lat, lon) {
	position = { lat, lon };
	document.querySelector("#position").innerText = JSON.stringify(position);
}

// WINDY

let iframe = document.getElementsByTagName("iframe")[0];
iframe.onload = function() {
	console.log("iframe loaded");
	let iframeWindow = iframe.contentWindow;
	console.log("iframeWindow", iframeWindow);
	W = iframeWindow.W;
	L = iframeWindow.L;

	let ipLocation = W.store.get("ipLocation");
	let gpsLocation = W.store.get("gpsLocation");
	if (gpsLocation) {
		setPosition(gpsLocation.lat, gpsLocation.lon);
	} else if (ipLocation) {
		setPosition(ipLocation.lat, ipLocation.lon);
	}


	var s = W.products, a = W.http, t = W.rootScope, E = W.utils, e = W.overlays, r = W.store, o = W.broadcast;


	var baseUrl = window.location.origin;

	W.labelsLayer.fcstUrl = `${baseUrl}/cityforecast`;

	W.labelsLayer.updateProduct = function(e) {
		var t = r.get("product");
		s[t].labelsTemp || (t = "ecmwf");
		var n = s[t].refTime();
		if ((this.product !== t || this.refTime !== n) && (this.product = t,
			this.refTime = n,
			e))
			for (var i in this.cityDivs)
				this.loadFcstTile(this.cityDivs[i])
	};

	W.labelsLayer.refreshWeather = function() {
		for (var e in this.cityDivs)
			for (var t = this.cityDivs[e], n = t.start, i = t.step, s = t.labels, a = 0; a < s.length; a++)
				this.renderWeather(n, i, s[a])
	};

	W.labelsLayer._loadTile = function(e, t) {
		var n = this;
		this._adjustTilePoint(t);
		var i = t.z + "/" + t.x + "/" + t.y;
		a.get(this.tilesUrl + "/" + i + ".json").then(this.onTileLoaded.bind(this, this.syncCounter, t, e)).then(function(e) {
			e.urlFrag = i;
			n.loadFcstTile(e);
		}).catch(function(e) {
			0
		})
	};

	W.labelsLayer.loadFcstTile = function(e) {
		e.labels && e.labels.length && a.get(this.fcstUrl + "/" + this.product + "/" + e.urlFrag).then(this.onFcstLoaded.bind(this, this.syncCounter, e)).catch(function(e) {
			0
		})
	}

	W.labelsLayer.onTileLoaded = function(e, t, n, i) {
		var s = i.data;
		if (e === this.syncCounter)
			return this.cityDivs[t.x + ":" + t.y] = this.renderTile(n, t, s)
	};

	W.labelsLayer.onFcstLoaded = function(e, t, n) {
		var i = this
			, s = n.data;
		if (e === this.syncCounter) {
			var a = s.start
				, r = s.step;
			t.start = a,
				t.step = r,
				t.labels.forEach(function(e) {
					var t = e.id;
					t in s && (e.data = s[t],
						i.renderWeather(a, r, e))
				})
		}
	};

	W.labelsLayer.renderTile = function(e, t, n) {
		for (var i = this._getTilePos(t), s = i.x, a = i.y, r = this._map.getPixelOrigin(), o = r.x, l = r.y, c = 256 << t.z, d = [], u = 0; u < n.length; ++u) {
			var h = n[u]
				, f = h[0]
				, m = h[1]
				, p = h[2]
				, g = h[3]
				, v = h[4]
				, w = h[5]
				, y = h[6]
				, b = "ci" !== p.substr(0, 2)
				, T = b ? f : v.toFixed(2) + "/" + g.toFixed(2)
				, L = Math.floor(E.lonDegToXUnit(g) * c - o - w / 2) - s
				, S = Math.floor(E.latDegToYUnit(v) * c - l - y / 2) - a
				, A = document.createElement("div");
			A.textContent = A.dataset.label = m,
				A.dataset.id = T,
				A.className = p,
				A.style.transform = "translate(" + L + "px, " + S + "px)",
				A.style.width = w + "px",
			b || d.push({
				id: T,
				el: A
			}),
				e.appendChild(A)
		}
		return e.classList.add("leaflet-tile-loaded"),
			{
				labels: d
			}
	};

	W.labelsLayer.renderWeather = function(e, t, n) {
		var i = n.el
			, s = n.data;
		if (i)
			if (s && s.length) {
				var a = this.ts - e
					, r = Math.round(a / (t * E.tsHour));
				0 <= r && r < s.length ? i.dataset.temp = this.tempConverter(s[r]) + "°" : delete i.dataset.temp
			} else
				delete i.dataset.temp
	};

	W.labelsLayer.onClick = function(e) {
		var t = e && e.target
			, n = t && t.dataset
			, i = n && n.id;
		if (i) {
			var s = i.split("/")
				, a = s[0]
				, r = s[1];
			o.emit("rqstOpen", "picker", {
				lat: a,
				lon: r
			}),
				e.preventDefault(),
				e.stopPropagation()
		}
	};

	W.labelsLayer._container.onclick = W.labelsLayer.onClick;

	let css =`
			.embed-map #bottom,
			.embed-map #mobile-ovr-select {
				display: none !important;
			}
			
			body .picker-content, body .picker-lines::before {
				display: none;
			}
			body .picker .picker-lines {
				height: 0;
				border-left-width: 0;
			}
			body.overlay-radar .labels-layer [data-id]::after {
				display: block;
			}
			body.overlay-radar #map-container .leaflet-objects-pane .labels-layer {
				text-shadow: none;
			}
		`,
		head = iframeWindow.document.head,
		style = iframeWindow.document.createElement('style');

	style.type = 'text/css';
	style.appendChild(iframeWindow.document.createTextNode(css));
	head.appendChild(style);

	W.picker.on('pickerOpened', latLon => {
		// picker has been opened at latLon coords

		console.log('pickerOpened', latLon);
		setPosition(latLon.lat, latLon.lon);
	});
	W.picker.on('pickerMoved', latLon => {
		// picker has been opened at latLon coords

		console.log('pickerMoved', latLon);
		setPosition(latLon.lat, latLon.lon);


	});

	W.labelsLayer._reset();


	W.store.set('overlay', 'radar')
	W.map.setZoom(zoom)
	W.map.panTo(L.latLng(lat, lon))

}
