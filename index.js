const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const morgan = require('morgan')
app.use(morgan('dev'))

const PORT = process.env.DATABASE_URL || 4000

const connectToDF = required('./chatbot.js')

app.post('/chatbot', (request, response, next) => {
    const message = request.body.message
    
})

app.get('/', (req, res) => {
    return 'hi'
})



app.listen(PORT)