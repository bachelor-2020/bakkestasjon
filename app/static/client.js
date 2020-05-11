var clients = []


function updateClientPos() {
	ajaxGet("/api/clients/position", (res) => {
		for (c of res) {
			var client = clients.find(e => e.id === c._id)
			if (client) {
				client.position = c.position
				client.marker.setLatLng([c.position.latitude, c.position.longitude])
			}
			else {
				ajaxGet(`/api/clients/${c._id}`, (res) => {
					var client = {
						id: res._id,
						name: res.name,
						position: res.position,
						marker: L.circleMarker([res.position.latitude,res.position.longitude])
							.bindTooltip(res.name) .addTo(layers.clients)
					}
					clients.push(client)
				})
			}
		}
	})
}

setInterval(updateClientPos, 500)
