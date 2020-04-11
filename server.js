const express = require('express')

const app = express()
const port = 3000


// Serve statiske filer
app.use('/',express.static('static_html'))

app.listen(port, () => console.log(`Bakkestasjon kjører på port ${port}`))
