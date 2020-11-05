const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const connectToDF = require('./chatbot.js')

app.post('/chatbot', (request, response) => {
    connectToDF(request)
        .then((response) => response.send({ message: response }))
        .catch((error) => response.send({ 'ERROR': error}))
})

app.get('/', (request, response) => response.json({message: "Hello"}))

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')