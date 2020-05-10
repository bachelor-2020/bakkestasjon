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

var drawControl = new L.Control.Draw({position: "topleft"})
map.addControl(drawControl)
