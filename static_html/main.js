
var waypoints = L.layerGroup()
var drones = L.layerGroup()
var searchAreas = L.layerGroup()

L.marker([59.368750, 10.442077]).bindTooltip('Her er kantina').addTo(waypoints)
L.marker([59.368750, 10.452077]).bindTooltip('Her er drona').addTo(drones)


var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var satellite   = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
	streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr})

var map = L.map('map', {
	center: [59.368750, 10.442077],
	zoom: 15,
	layers: [satellite, searchAreas, waypoints, drones]
})

var baseLayers = {
	"Satellite": satellite,
	"Streets": streets
}

var overlays = {
	"Search Areas": searchAreas,
	"Waypoints": waypoints,
	"Drones": drones
}

L.control.layers(baseLayers, overlays).addTo(map)
var options = {
	position: 'topleft',
	draw: {
		polygon: {
			allowIntersection: false, // Restricts shapes to simple polygons
			drawError: {
				color: '#e1e100', // Color the shape will turn when intersects
				message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
			},
			shapeOptions: {
				color: '#97009c'
			}
		},
		polyline: {
			shapeOptions: {
				color: '#f357a1',
				weight: 10
			}
		},
		rectangle: {
			shapeOptions: {
				fill: false
			}
		},
		// disable toolbar item by setting it to false
		polyline: false,
		circle: false, // Turns off this drawing tool
		polygon: false,
		marker: false,
	}
}

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw(options)
map.addControl(drawControl)
L.control.scale({imperial: false}).addTo(map);


function survey(area) {
	var surv = L.layerGroup()

	var west = area.getWest()
	var east = area.getEast()
	var north = area.getNorth()
	var south = area.getSouth()

	var points = []
	var i
	for (i=0; north-i*0.001>south; i++) {
		var p1 = [north-i*0.001, west]
		var p2 = [north-i*0.001, east]

		if (i%2==0) {
			points.push(p1)
			points.push(p2)
		}
		else {
			points.push(p2)
			points.push(p1)
		}
	}

	if (p1[0] > south) {
		if (i%2==0) {
			points.push([south, west])
			points.push([south, east])
		}
		else {
			points.push([south,east])
			points.push([south,west])
		}
	}

	surv.addLayer(L.polyline(points, {opacity: 0.5}))
	searchAreas.addLayer(surv)
	return surv
}

map.on('draw:created', function(e) {
	var type = e.layerType
	var layer = e.layer

	if (type == "rectangle") {
		var s = survey(layer.getBounds())
		map.addLayer(s)
		layer.childSurvey = s
	}


	layer.editing.enable()
	layer.on("edit", function(E) {
		console.log(E.target.getBounds())
		console.log(E.target)
		map.removeLayer(E.target.childSurvey)
		E.target.childSurvey = survey(E.target.getBounds())
		map.addLayer(E.target.childSurvey)
	})

	map.addLayer(layer)
})
navigator.geolocation.getCurrentPosition(position => alert(position.coords.latitude), error => alert(errror), {timeout: 10000})
