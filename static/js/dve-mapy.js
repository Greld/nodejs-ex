
var lat = 49.1718178, lon = 16.5990164, zoom = 10;
var W, L;
var mode = "Mapy.cz";
showCorrectMap();

function prepni(elem) {
	mode = (mode === "Mapy.cz") ? "Radar" : "Mapy.cz";
	if (elem){
		elem.innerText = "Přepnout na " + ((mode === "Mapy.cz") ? "Radar" : "Mapy.cz");
	}
	showCorrectMap();
}

function showCorrectMap(){
	if (mode === "Mapy.cz") {
		document.getElementById("sznMap").style.visibility = "visible";
		document.getElementById("windyMap").style.visibility = "hidden";
	} else {
		document.getElementById("sznMap").style.visibility = "hidden";
		document.getElementById("windyMap").style.visibility = "visible";
	}
}

// MAPY.CZ
var stred = SMap.Coords.fromWGS84(lon, lat);
var mapa = new SMap(JAK.gel("sznMap"), stred, zoom);
mapa.addDefaultLayer(SMap.DEF_BASE).enable();
mapa.addDefaultControls();

var posluchac = function(e) {
	setTimeout(() => {
		if (e.type === "zoom-stop") {
			let z = mapa.getZoom();
			if (z !== zoom) {
				zoom = z;
				//console.log("zoom", zoom);
				if (W) {
					W.map.setZoom(zoom, {
						animate: false
					});
				}
			}
		} else if (e.type === "map-pan") {
			let center = mapa.getCenter().toWGS84();
			//console.log("center", center);
			lat = center[0];
			lon = center[1];
			if (W) {
				W.map.panTo(L.latLng(lon, lat), {
					animate: false
				});
			}
		}
	}, 0);
};

var signals = mapa.getSignals();
signals.addListener(window, "*", posluchac);



// WINDY

let iframe = document.getElementsByTagName("iframe")[0];
iframe.onload = function() {
	console.log("iframe loaded");
	let iframeWindow = iframe.contentWindow;
	console.log("iframeWindow", iframeWindow);
	W = iframeWindow.W;
	L = iframeWindow.L;


	var s = W.products, a = W.http, t = W.rootScope, E = W.utils, e = W.overlays, r = W.store, o = W.broadcast;

	W.labelsLayer.fcstUrl = "https://ims-s.windy.com/forecast/citytile/v1.3"

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
			body.overlay-radar #map-container .leaflet-objects-pane .labels-layer {
				text-shadow: none;
			}
			body.embed-map #embed-zoom {
				position: absolute;
				left: 40px;
				bottom: 24px;
				transform: scale(1.1, 1.1);
				right: auto;
				top: auto;
			}
			body.embed-map #embed-zoom .zoom-ctrl {
				color: black;
				display: inline-block;
				margin-right: 8px;
				border-radius: 0;
				background-color: white;
				margin-bottom: 4px;
			}
			body.embed-map #embed-zoom .zoom-ctrl:hover {
				background-color: rgb(203, 203, 203);
			}
		`,
		head = iframeWindow.document.head,
		style = iframeWindow.document.createElement('style');

	style.type = 'text/css';
	style.appendChild(iframeWindow.document.createTextNode(css));
	head.appendChild(style);

	W.broadcast.on('mapChanged', params => {

		lat = params.lat;
		lon = params.lon;
		zoom = params.zoom;

		var stred = SMap.Coords.fromWGS84(lon, lat);
		mapa.setCenterZoom(stred, zoom, false);

	});

	W.picker.on('pickerOpened', latLon => {
		// picker has been opened at latLon coords

		console.log('pickerOpened', latLon);

	});
	W.picker.on('pickerMoved', latLon => {
		// picker has been opened at latLon coords

		console.log('pickerMoved', latLon);

	});

	W.labelsLayer._reset();


	W.store.set('overlay', 'radar')
	W.map.setZoom(zoom)
	W.map.panTo(L.latLng(lat, lon))

}
