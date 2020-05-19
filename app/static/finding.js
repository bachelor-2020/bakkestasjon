var findings = []


function updateFindings() {
	ajaxGet("/api/findings", (res) => {
		for (f of res) {
			var finding = findings.find(e => e.image_id === f.image_id)
			if (!finding) {
				ajaxGet(`/api/findings/${f.image_id}`, (res) => {
					var html_image = `<img src="data:image/png;base64,${res.image}"/>`
					var finding = {
						image_id: res.image_id,
						position: res.position,
						marker: L.marker([res.position.latitude, res.position.longitude])
							.bindPopup(html_image)
							.bindTooltip("Potential finding")
							.addTo(layers.findings)
					}
					findings.push(finding)
				})
			}
		}
	})
}

setInterval(updateFindings, 1000)
