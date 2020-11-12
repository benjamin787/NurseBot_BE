const dialogflow = require('@google-cloud/dialogflow');

const express = require('express')
const app = express()

// const corsOptions = {
//     origin: '*',
//     methods: 'GET,HEAD,PUT,POST,PATCH,DELETE'
// }

const cors = require('cors')
// app.use(cors(corsOptions))
app.use(cors())


const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.options('/chatbot', cors())

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
// const sessionPath = dialogClient.projectAgentEnvironmentUserSessionPath(projectId, sessionId)

let context = [];

app.post('/serve', async (request, response) => {
    response.headers = {
        "Access-Control-Allow-Origin": "https://covid-nurse-bot.web.app",
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

    console.log('chatbot request body', request.body)
    console.log('chatbot request session', request.session)
    console.log('chatbot request headers', request.headers)

    let hookRequest = JSON.parse(request.body)

    if (hookRequest.queryResult.allRequiredParamsPresent) {
        matchIntent(hookRequest)
    }    

    context = hookRequest.queryResult.outputContexts[0]
    console.log('assigned context. check data structure', context)

    response.send({fulfillmentText: 'you are beautiful'})
})

const findTest = location => {
    axios.get(`https://covid-19-testing.github.io/locations/${location.state}/complete.json`)
        .then(response => response.json())
        .then(result => {
            const siteCheck = result.select(site => site.physical_address[0].city == location.city)
            console.log('siteCheck', siteCheck)
            if (siteCheck.physical_address) {
                botResult.queryResult.fulfillmentText = `There's a test center at ${siteCheck.physical_address.address_1}.`
            }
        }).catch(error => console.log('find test error', error))
}

const matchIntent = hookRequest => {
    let middleIntent = hookRequest.queryResult.intent
    let middleParams = hookRequest.queryResult.parameters
    if (middleIntent.displayName == 'Find Tests') {
        console.log('you son of a bitch, im in')
    } else if (middleIntent.displayName == "Find Test Location") {
        console.log('intent name match is hit')
        // findTest(middleParams)
    }
}

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')