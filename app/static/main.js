var xhttp = new XMLHttpRequest()

var waypoints = L.layerGroup()
var drones = L.layerGroup()
var searchAreas = L.layerGroup()

L.marker([59.368750, 10.442077]).bindTooltip('Her er kantina').addTo(waypoints)
var drone_0 = L.marker([59.368750, 10.452077]).bindTooltip('Her er drona').addTo(drones)


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
				color: '#97009c',
				fill: true
			}
		},
		rectangle: {
			shapeOptions: {
				fill: true
			}
		},
		// disable toolbar item by setting it to false
		polyline: false,
		circle: false, // Turns off this drawing tool
		marker: false,
		circlemarker: false,
	}
}

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw(options)
map.addControl(drawControl)
L.control.scale({imperial: false}).addTo(map);

function editLayer(layer) {
	if (selectedElement)
		selectedElement.editing.disable()
	selectedElement = layer
	layer.editing.enable()
}

function meter2deg(meter) {
	return meter/111111
}

function survey(layer, trackWidth=5) {
	var area = layer.getBounds()
	var width = meter2deg(trackWidth)

	var west = area.getWest() - 10
	var east = area.getEast() + 10
	var north = area.getNorth() - width/2
	var south = area.getSouth() + width/2

	var points = []
	var i=0
	for (var lat=north; lat>south; lat-=width) {
		var p1 = [lat, west]
		var p2 = [lat, east]

		var line = L.polyline([p1,p2])
		var inter = turf.lineIntersect(line.toGeoJSON(), layer.toGeoJSON())

		var P = inter.features.map(d => {return d.geometry.coordinates})
		p1 = P[0]
		p2 = P[1]

		if (p1!=null && p2!=null) {
			p1 = [p1[1], p1[0]]
			p2 = [p2[1], p2[0]]

			if (i%2==0) {
				points.push(p1)
				points.push(p2)
			}
			else {
				points.push(p2)
				points.push(p1)
			}
			i++
		}
	}

	var flightPattern = L.polyline(points, {opacity: 0.5, weight: 5})
	flightPattern.parent = layer
	flightPattern.on("click", e => {
		L.DomEvent.stopPropagation(e)
		editLayer(e.target.parent)
	})
	flightPattern.waypoints = points
	searchAreas.addLayer(flightPattern)
	layer.childSurvey = flightPattern
}

var selectedElement = null
map.on('draw:created', function(e) {
	var type = e.layerType
	var layer = e.layer

	survey(layer)
	layer.on("edit", function(E) {
		searchAreas.removeLayer(E.target.childSurvey)
		survey(E.target)
	})


	layer.on("click", e => {
		L.DomEvent.stopPropagation(e)
		editLayer(e.target)
	})

	map.addLayer(layer)
})

map.on("click", e => {
	if (selectedElement)
		selectedElement.editing.disable()
	selectedElement = null
})


function updateDronePosition() {
	xhttp.open("GET", "/api/drones/0/position", true)
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState === XMLHttpRequest.DONE) {
			var pos = JSON.parse(this.responseText)["position"]
			var lat = pos["latitude"]
			var lng = pos["longitude"]
			var alt = pos["altitude"]

			drone_0.setLatLng([lat,lng])
		}
	}
	xhttp.send()
}
setInterval(updateDronePosition,1000)

function startMission() {

	searchAreas.eachLayer(layer => {
		post_data = []
		for (const wp of layer.waypoints) {
			post_data.push({
				"latitude": wp[0],
				"longitude": wp[1],
				"altitude": 10
			})
		}
		xhttp.open("POST", "/api/drones/0/mission", true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send(JSON.stringify({"mission":post_data}))
	})
}

navigator.geolocation.getCurrentPosition(function(position){
	xhttp.open("POST", "/api/clients/0/position", true)
	xhttp.setRequestHeader("Content-type", "application/json")
	xhttp.send(JSON.stringify({
		"position": {
			"latitude": position.coords.latitude,
			"longitude": position.coords.longitude
		}
	}))
})
