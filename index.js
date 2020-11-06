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
    response.headers = {"Access-Control-Allow-Origin": "https://covid-nurse-bot.web.app"}
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