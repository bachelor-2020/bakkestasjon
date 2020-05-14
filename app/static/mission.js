var mission = {
	areas: [],
	points: [],
	areaCount: 0
}

// Fjern forrige mission fra kartet
function clearMission() {
	layers.areas.eachLayer((l) => {
		map.removeLayer(l)
	})
}

// Hent nyeste mission fra API og eventuelt oppdater mission på kartet
var lastPoints
function updateMission() {
	ajaxGet("/api/mission", (res) => {
		if (res && JSON.stringify(res.points) !== JSON.stringify(lastPoints)) {
			lastPoints = res.points
			mission.points = res.points
			ajaxGet("/api/areas", (res) => {
				mission.areas = res
				clearMission()
				drawMission()
			})
		}
	})
}
setInterval(updateMission, 500)


// Finner koordinater [x,y] meter unna original posisjon
function addToCoord(position, distance) {
	var earth_radius = 6378000
	var latitude = position[0]
	var longitude = position[1]
	var dy = distance[0]
	var dx = distance[1]
	var new_lat = latitude  + (dy / earth_radius) * (180 / Math.PI)
	var new_lng = longitude + (dx / earth_radius) * (180 / Math.PI) / Math.cos(latitude * Math.PI/180)
	return [new_lat, new_lng]
}

// Lag ny mission
function createMission(layer) {
	mission.areas = []
	mission.points = layer.getLatLngs()

	subdivide(layer)

	clearMission()
	drawMission()
}


// Del opp et søkeområde i mindre ruter
function subdivide(layer) {
	var bounds = layer.getBounds()
	var boxWidth = 100
	var trackWidth = 5

	var [north, west] = addToCoord(
		[bounds.getNorth(), bounds.getWest()],
		[trackWidth, 0])
	var [south, east] = addToCoord(
		[bounds.getSouth(), bounds.getEast()],
		[-trackWidth, 0])

	for (var lat=north; lat>south; ) {
		var p1, p2
		for (var lng=west; lng<east; ) {
			p1 = [lat, lng]
			p2 = addToCoord([lat, lng], [-boxWidth,boxWidth])
			var box = L.rectangle([p1, p2])
			var intersection = turf.intersect(box.toGeoJSON(), layer.toGeoJSON())
			if (intersection) {
				var subdivision = L.geoJSON(intersection, {pointToLayer: ()=>{}})
				survey(subdivision, intersection, box.getBounds())
			}
			p2 = addToCoord(p2, [-trackWidth, trackWidth])
			lng = p2[1]
		}
		lat = p2[0]
	}
}


// Skravere et område for gjennomsøk
function survey(layer, geojson, bounds, trackWidth=5) {
	var west = bounds.getWest()
	var east = bounds.getEast()
	var north = bounds.getNorth()
	var south = bounds.getSouth()

	// Lager waypoints
	var points = []
	var i=0
	for (var lat=north; lat>south; ) {
		var line = L.polyline([[lat,west], [lat,east]])
		var inter = turf.lineIntersect(line.toGeoJSON(), layer.toGeoJSON())
		var [p1,p2] = inter.features.map(d => {return d.geometry.coordinates})
		if (p1!=null && p2!=null) {
			var p = [p1.reverse(), p2.reverse()]

			if (i%2 == 0) p.reverse()
			points = points.concat(p)
			i++
		}
		lat = addToCoord([lat,west], [-trackWidth,0])[0]
	}

	// geojson har koordinater speilvendt :(
	var corners = []
	for (c of geojson.geometry.coordinates[0]) {
		corners.push(c.reverse())
	}


	mission.areaCount += 1

	// Legg inn område med waypoints osv i mission
	mission.areas.push({
		_id: mission.areaCount,
		waypoints: points,
		wp_reached: [],
		done: 0,
		bounds: {
			north: north,
			south: south,
			west: west,
			east, east
		},
		points: corners,
		taken: 0
	})
}


// Tegn mission på kartet
function drawMission() {
	L.polygon(mission.points, {fill: false, opacity: 0.5, weight: 5}).addTo(layers.areas)
	for (area of mission.areas) {
		L.polygon(area.points, {fill: false}).addTo(layers.areas)
		L.polyline(area.waypoints, {opacity: 0.5, weight: 5}).addTo(layers.areas)
	}
}


// Last opp mission
function startMission() {
	ajaxPost("/api/mission",{
			areas: mission.areas,
			points: mission.points
		},
		(res) => {}
	)
}


map.on('draw:created', function(e) {
	var type = e.layerType
	var layer = e.layer

	if (type=="rectangle" || type=="polygon") {
		createMission(layer)
	}
})
