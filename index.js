const dialogflow = require('@google-cloud/dialogflow');

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())
// app.options('/chatbot', cors())

const asyncHandler = require('express-async-handler')

const createError = require('http-errors')

const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const axios = require('axios');
const uuid = require('uuid');

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')

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

    const { message } = request.body

    // const parsedRequest = JSON.parse(request.body.body)
    
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

    // try {
    //     let botResult = await dialogClient.detectIntent(botRequest)
    //     console.log('botresult fulfillment messages',botResult[0].queryResult.fulfillmentMessages)
    //     response.json(botResult[0])
    // } catch(error) {
    //     console.log('TRY CATCH error', error)
    //     response.json({message: 'blahblah', error: error})
    // }
    
    let botResult = await dialogClient.detectIntent(botRequest)
    console.log('botresult fulfillment messages',botResult[0].queryResult.fulfillmentMessages)

    botResult[0]
        ? respond.json(botResult[0])
        : () => { throw createError(500,
            "I didn't catch that. Could you say it differently?"
            )}

    // if (!botResult[0]) throw createError(500, "I didn't catch that. Could you say it differently?")
    
}))

app.post('/chatbot', asyncHandler(async (request, response) => {

    let hookRequest = request.body

    if (hookRequest.queryResult.allRequiredParamsPresent) {
        let hookResponse = await matchIntent(hookRequest)
        context = hookRequest.queryResult.outputContexts[0]
    
        console.log('assigned context. check data structure', context)
        console.log('hookResponse',hookResponse)

        response.send(hookResponse)
        hookResponse = {}

    } else {
        throw createError(500, 'Try try again')
    }

    // try { hookResponse = hookRequest.queryResult.allRequiredParamsPresent
    //     ? await matchIntent(hookRequest)
    //     : setTimeout(() => {queryResult: 'yikes'}, 500)

    //     context = hookRequest.queryResult.outputContexts[0]

    //     console.log('assigned context. check data structure', context)
    //     console.log('hookResponse',hookResponse)
        
    //     response.send(hookResponse)
    //     hookResponse = {}
    // } catch(error) {
    //     console.log(error)
    // }
    
}))

const matchIntent = async hookRequest => {
    let middleRequest = hookRequest.queryResult

    let middleResponse = '';
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
    console.log('location',location)
    return (
        axios.get(`https://covid-19-testing.github.io/locations/${location.state.toLowerCase()}/complete.json`)
            .then(({ data }) => {
                let siteCheck = data.find(site => site.physical_address[0].city == location.city)

                return (siteCheck.physical_address
                    ? `There's a test center at ${siteCheck.physical_address[0].address_1}.`
                    : `No address given for the site at ${siteCheck.name}.`
                )
            }).catch(error => console.log('find test error', error))
    )
}

app.use((error, request, response, next) => {
    response.status(error.status)
    response.json({
        status: error.status,
        message: error.message,
        stack: error.stack
    })
})