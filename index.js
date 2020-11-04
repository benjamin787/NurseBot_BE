const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let urlEncoded = bodyParser.urlencoded({ extended: true })

const connectToDF = required('./chatbot.js')

app.post('/chatbot', jsonParser, urlEncoded, (request, response) => {
    const message = request.body.message
    connectToDF(message)
        .then((response) => response.send({ message: response }))
        .catch((error) => response.send({ 'ERROR': error}))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')