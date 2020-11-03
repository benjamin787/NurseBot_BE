const express = require('express')
const app = express()

const PORT = process.env.DATABASE_URL || 4000

const bodyParser = require('body-parser')
app.use(bodyParser)

const cors = require('cors')

const serviceAccount = require('./service-account.json')

app.get('/', (req, res) => {
    return 'hi'
})



app.listen(PORT)