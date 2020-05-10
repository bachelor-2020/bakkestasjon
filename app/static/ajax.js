function ajaxGet(url, callback) {
	var xhttp = new XMLHttpRequest()
	xhttp.open("GET", url, true)
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState === XMLHttpRequest.DONE) {
			callback(JSON.parse(this.responseText))
		}
	}
	xhttp.send()
}

function ajaxPost(url, post, callback) {
	var xhttp = new XMLHttpRequest()
	xhttp.open("POST", url, true)
	xhttp.setRequestHeader("Content-type", "application/json")
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState === XMLHttpRequest.DONE) {
			callback(JSON.parse(this.responseText))
		}
	}
	xhttp.send(JSON.stringify(post))
}
