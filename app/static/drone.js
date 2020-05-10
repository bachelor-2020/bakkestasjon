var drones = []


function updateDronePos() {
	ajaxGet("/api/drones/position", (res) => {
		for (d of res) {
			var drone = drones.find(e => e.id === d._id)
			if (drone) {
				drone.position = d.position
				drone.marker.setLatLng([d.position.latitude, d.position.longitude])
				drone.trail.addLatLng([d.position.latitude, d.position.longitude])
			}
			else {
				ajaxGet(`/api/drones/${d._id}`, (res) => {
					var drone = {
						id: res._id,
						name: res.name,
						position: res.position,
						marker: L.marker([res.position.latitude,res.position.longitude])
							.bindTooltip(res.name) .addTo(layers.drones)
					}
					var points = []
					for (p of res.trail) {
						points.push([p.position.latitude, p.position.longitude])
					}
					drone.trail = L.polyline(points).addTo(layers.trails)

					drones.push(drone)
				})
			}
		}
	})
}

setInterval(updateDronePos, 500)
