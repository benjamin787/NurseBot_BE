const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())


const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.options('/chatbot', cors())

const { WebhookClient } = require('dialogflow-fulfillment')

app.post('/chatbot', (request, response) => {
    dialogflowFulfillment(request, response)
})

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request, response})

    function sayHello(agent) {
        agent.add('yay')
    }

    let intentMap = new Map()
    intentMap.set('Default Welcome Intent', sayHello)
    agent.handleRequest(intentMap)
}