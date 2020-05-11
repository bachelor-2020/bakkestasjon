
var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var L_satellite   = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
	L_streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr})

var L_OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var L_Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var layers = {
	drones: L.layerGroup(),
	trails: L.layerGroup(),
	areas: L.layerGroup(),
	clients: L.layerGroup(),
}

var map = L.map('map', {
	center: [59.368750, 10.442077],
	zoom: 15,
	layers: [L_satellite, layers.areas, layers.drones, layers.trails, layers.clients]
})


var baseLayers = {
	"Google Maps": L_satellite,
	"OpenStreetMap": L_streets,
	"OpenTopoMap": L_OpenTopoMap,
	"ESRI World Imagery": L_Esri_WorldImagery
}

var overlays = {
	"Search Areas": layers.areas,
	"Drones": layers.drones,
	"Drone trail": layers.trails,
	"Clients": layers.clients
}

L.control.layers(baseLayers, overlays).addTo(map)
L.control.scale({imperial: false}).addTo(map);
