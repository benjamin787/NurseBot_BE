const dialogflow = require('@google-cloud/dialogflow');

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())
app.options('/chatbot', cors())

const asyncHandler = require('express-async-handler')

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

app.post('/serve', asyncHandler(async (request, response) => {
    response.headers = {
        "Access-Control-Allow-Origin": "https://covid-nurse-bot.herokuapp.com",
        "Content-Type": "application/json"
    }

    const { message } = request.body.body
    
    const botRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                languageCode: "en-US",
                text: message
            }
        }
    }

    if (context && context.length > 0) {
        botRequest.queryParams = {contexts: context};
    }

    try {
        let botResult = await dialogClient.detectIntent(botRequest)
        response.json(botResult[0])
    } catch(e) {
        response.json({
            message: "I didn't catch that. Could you say it differently?",
            error: e
        })
    }
}))

app.post('/chatbot', asyncHandler(async (request, response) => {

    let hookRequest = request.body.body
    
    try {
        hookResponse = await matchIntent(hookRequest)
        
        context = hookRequest.queryResult.outputContexts[0]
        
        response.json(hookResponse)
        hookResponse = {}
    } catch(e) {
        response.json({
            message: "I didn't catch that. Could you say it differently?",
            error: e
        })
    }
}))

const matchIntent = async hookRequest => {
    let middleRequest = hookRequest.queryResult
    let middleResponse = ''

    switch (middleRequest.intent.displayName) {
        case 'Find Test Location':
            middleResponse = findTest(middleRequest.parameters);
            break;
        default:
            middleResponse = 'Darn it. Default again.'
            break;
    }
    return {queryResult: {fulfillmentText: middleResponse}}
}

const findTest = location => {
    axios.get(`https://covid-19-testing.github.io/locations/${location.state.toLowerCase()}/complete.json`)
        .then(({ data }) => {
            let siteCheck = data.find(site => site.physical_address[0].city == location.city)

            return (siteCheck.physical_address
                ? `There's a test center at ${siteCheck.physical_address[0].address_1}.`
                : `No address given for the site at ${siteCheck.name}.`
            )
        }).catch(e => console.log(e))
}

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')