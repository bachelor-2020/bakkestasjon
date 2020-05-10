
var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var L_satellite   = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
	L_streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr})

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
	"Satellite": L_satellite,
	"Streets": L_streets
}

var overlays = {
	"Search Areas": layers.areas,
	"Drones": layers.drones,
	"Drone trail": layers.trails,
	"Clients": layers.clients
}

L.control.layers(baseLayers, overlays).addTo(map)
L.control.scale({imperial: false}).addTo(map);
