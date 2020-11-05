const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const { WebhookClient } = require('dialogflow-fulfillment')

//might have to pass express.json() in
app.post('/chatbot', (req, res) => {
    const agent = new WebhookClient({
        req: req,
        res: res
    })
    function test(agent) {
        agent.add('you got this!')
    }
    let intentMap = new Map()
    intentMap.set('Find Tests', test)
    agent.handleRequest(intentMap)
})




const connectToDF = require('./chatbot.js')
const { request } = require('express')

// app.post('/chatbot', (request, response) => {
//     connectToDF(request)
//         .then((response) => response.send({ message: response }))
//         .catch((error) => response.send({ 'ERROR': error}))
// })

app.get('/', (request, response) => response.json({message: "Hello"}))

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')