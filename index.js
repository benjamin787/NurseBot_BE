const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const morgan = require('morgan')
app.use(morgan('dev'))

const PORT = process.env.PORT || 4000

const connectToDF = required('./chatbot.js')

app.post('/chatbot', (request, response, next) => {
    const message = request.body.message
    connectToDF(message)
        .then((response) => response.send({ message: response }))
        .catch((error) => response.send({ 'ERROR': error}))
})

app.listen(PORT)