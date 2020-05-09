
var L_waypoints = L.layerGroup()
var L_drones = L.layerGroup()
var L_droneTrail = L.layerGroup()
var L_clients = L.layerGroup()
var L_searchAreas = L.layerGroup()

var drone_0 = L.marker([59.368750, 10.452077]).bindTooltip('Her er drona').addTo(L_drones)


var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var L_satellite   = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
	L_streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr})

var map = L.map('map', {
	center: [59.368750, 10.442077],
	zoom: 15,
	layers: [L_satellite, L_searchAreas, L_waypoints, L_drones, L_droneTrail, L_clients]
})

var baseLayers = {
	"Satellite": L_satellite,
	"Streets": L_streets
}

var overlays = {
	"Search Areas": L_searchAreas,
	"Waypoints": L_waypoints,
	"Drones": L_drones,
	"Drone trail": L_droneTrail,
	"Clients": L_clients
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

var MyCustomMarker = L.Icon.extend({
	options: {
		shadowUrl: null,
		iconAnchor: new L.Point(12, 12),
		iconSize: new L.Point(24, 24),
		iconUrl: 'link/to/image.png'
	}
})

L.DrawToolbar.include({
	getModeHandlers: function (map) {
		return [
			{
				enabled: true,
				handler: new L.Draw.Rectangle(map, { metric: true}),
				title: 'Rectangular search area'
			},
			{
				enabled: true,
				handler: new L.Draw.Polygon(map, { allowIntersection: false, showArea: true, metric: true, repeatMode: false }),
				title: 'Polygonal search area'
			},
			{
				enabled: true,
				handler: new L.Draw.Marker(map, { icon: new L.Icon.Default() }),
				title: 'Rally point'
			}
		]
	}
})


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

function subdivide(layer){
	var area = layer.getBounds()
	var width = meter2deg(100)

	var west = area.getWest() - width
	var east = area.getEast() + width
	var north = area.getNorth()
	var south = area.getSouth()


	for (var lat=north; lat>south; lat-=width) {
		for (var lng=west; lng<east; lng+=width) {
			var box = L.rectangle([[lat,lng],[lat+width,lng+width*2]])
			L.geoJSON(turf.intersect(box.toGeoJSON(), layer.toGeoJSON())).addTo(map)
		}
	}
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
	L_searchAreas.addLayer(flightPattern)
	layer.childSurvey = flightPattern
}

var selectedElement = null
map.on('draw:created', function(e) {
	var type = e.layerType
	var layer = e.layer

	if (type=="rectangle" || type=="polygon") {
		survey(layer)
		layer.on("edit", function(E) {
			L_searchAreas.removeLayer(E.target.childSurvey)
			survey(E.target)
		})
	}


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

var trailLine
var trail = []
var xhttp = new XMLHttpRequest()
xhttp.open("GET", "/api/drones/0/trail", true)
xhttp.onreadystatechange = function () {
	if(xhttp.readyState === XMLHttpRequest.DONE) {
		for (pos of JSON.parse(this.responseText)["trail"]) {
			var lat = pos["position"]["latitude"]
			var lng = pos["position"]["longitude"]
			trail.push([lat,lng])
		}

		trailLine = L.polyline(trail, {opacity: 0.5, weight: 5}).addTo(L_droneTrail)
	}
}
xhttp.send()

function updateDronePosition() {
	var xhttp = new XMLHttpRequest()
	xhttp.open("GET", "/api/drones/0/position", true)
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState === XMLHttpRequest.DONE) {
			var pos = JSON.parse(this.responseText)["position"]
			var lat = pos["latitude"]
			var lng = pos["longitude"]
			var alt = pos["altitude"]

			drone_0.setLatLng([lat,lng])
			trailLine.addLatLng([lat,lng])
		}
	}
	xhttp.send()
}
setInterval(updateDronePosition,500)

function startMission() {

	L_searchAreas.eachLayer(layer => {
		post_data = []
		for (const wp of layer.waypoints) {
			post_data.push({
				"latitude": wp[0],
				"longitude": wp[1],
				"altitude": 10
			})
		}
		var xhttp = new XMLHttpRequest()
		xhttp.open("POST", "/api/drones/0/mission", true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send(JSON.stringify({"mission":post_data}))
	})
}

var myPosMarker
function updateMyPosition() {
	navigator.geolocation.getCurrentPosition(function(position){
		var xhttp = new XMLHttpRequest()
		xhttp.open("POST", "/api/clients/0/position", true)
		xhttp.setRequestHeader("Content-type", "application/json")
		xhttp.send(JSON.stringify({
			"position": {
				"latitude": position.coords.latitude,
				"longitude": position.coords.longitude
			}
		}))
		var myPos = [ position.coords.latitude, position.coords.longitude ]
		if (myPosMarker) {
			myPosMarker.setLatLng(myPos)
		}
		else {
			myPosMarker = L.marker(myPos).bindTooltip('Her er du').addTo(L_clients)
		}
	})
}
setInterval(updateMyPosition,5000)

function toggleElement(e) {
	if (e.style.display=="none") {
		e.style.display = "block"
	}
	else if (e.style.display=="block") {
		e.style.display = "none"
	}
}
