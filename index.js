const dialogflow = require('@google-cloud/dialogflow');

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())
app.options('/chatbot', cors())

const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const axios = require('axios');
const uuid = require('uuid');

const sessionId = uuid.v4();
const userId = uuid.v4();

const projectId = process.env.PROJECT_ID

const options = {
    credentials: {
        private_key: JSON.parse(process.env.PRIVATE_KEY),
        client_email: process.env.CLIENT_EMAIL
    }
}

const dialogClient = new dialogflow.SessionsClient(options);
const sessionPath = `projects/${projectId}/locations/us/agent/environments/production/users/${userId}/sessions/${sessionId}`

let context = [];
let hookResponse = {};

app.post('/serve', async (request, response) => {
    response.headers = {
        "Access-Control-Allow-Origin": "https://covid-nurse-bot.herokuapp.com",
        "Content-Type": "application/json"
    }

    const parsedRequest = JSON.parse(request.body.body)
    
    const botRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                languageCode: "en-US",
                text: parsedRequest.message
            }
        }
    }

    if (context && context.length > 0) {
        botRequest.queryParams = {contexts: context};
    }

    try {
        let botResult = await dialogClient.detectIntent(botRequest)
        response.json(botResult[0])
    } catch(error) {
        console.log('TRY CATCH error', error)
        response.json({message: 'blahblah', error: error})
    }
})

app.post('/chatbot', async (request, response) => {

    let hookRequest = request.body

    if (hookRequest.queryResult.allRequiredParamsPresent) {
        try {
            await matchIntent(hookRequest)
        } catch(error) {
            console.log('ERROR',error)
        }
    }    

    context = hookRequest.queryResult.outputContexts[0]
    console.log('assigned context. check data structure', context)

    response.send(hookResponse)
    hookResponse = {}
    console.log('hookResponse reset works?',hookResponse)
})

const findTest = location => {
    axios.get(`https://covid-19-testing.github.io/locations/${location.state.toLowerCase()}/complete.json`)
        .then(({ data }) => {
            const siteCheck = data.find(site => site.physical_address[0].city == location.city)
            console.log('siteCheck', siteCheck)
            if (siteCheck.physical_address) {
                hookResponse.fulfillmentText = `There's a test center at ${siteCheck.physical_address[0].address_1}.`
            }
        }).catch(error => console.log('find test error', error))
}

const matchIntent = hookRequest => {
    let middleIntent = hookRequest.queryResult.intent
    let middleParams = hookRequest.queryResult.parameters
    console.log('middleParams',middleParams)
    console.log('middleIntent',middleIntent)

    if (middleIntent.displayName == 'Find Tests') {
        console.log('you son of a bitch, im in')
    } else if (middleIntent.displayName == "Find Test Location") {
        console.log('intent name match is hit')
        findTest(middleParams)
    }
}

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')