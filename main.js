
var cities = L.layerGroup()

L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.').addTo(cities)


var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var satellite   = L.tileLayer(mbUrl, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
	streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr})

var map = L.map('map', {
	center: [39.73, -104.99],
	zoom: 10,
	layers: [satellite, cities]
})

var baseLayers = {
	"Satellite": satellite,
	"Streets": streets
}

var overlays = {
	"Cities": cities
}

// Initialise the FeatureGroup to store editable layers
var editableLayers = new L.FeatureGroup()
map.addLayer(editableLayers)

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
		// disable toolbar item by setting it to false
		polyline: true,
		circle: true, // Turns off this drawing tool
		polygon: true,
		marker: true,
		rectangle: true,
	},
	edit: {
		featureGroup: editableLayers, //REQUIRED!!
		remove: true
	}
}

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw(options)
map.addControl(drawControl)

map.on('draw:created', function(e) {
	var type = e.layerType
	var layer = e.layer

	if (type === 'polyline') {
	    layer.bindPopup('A polyline!')
	}
	else if ( type === 'polygon') {
	    layer.bindPopup('A polygon!')
	}
	else if (type === 'marker') {
	    layer.bindPopup('marker!')
	}
	else if (type === 'circle') {
	    layer.bindPopup('A circle!')
	}
	else if (type === 'rectangle') {
	    layer.bindPopup('A rectangle!')
	}


	editableLayers.addLayer(layer)
})
