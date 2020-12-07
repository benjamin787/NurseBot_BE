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
        console.log('botresult',botResult)
        response.json(botResult[0])
    } catch(error) {
        console.log('TRY CATCH error', error)
        response.json({message: 'blahblah', error: error})
    }
})

app.post('/chatbot', async (request, response) => {

    let hookRequest = request.body

    if (hookRequest.queryResult.allRequiredParamsPresent) {
        hookResponse = await matchIntent(hookRequest)
    }
    hookResponse = hookRequest.queryResult.allRequiredParamsPresent
        ? await matchIntent(hookRequest)
        : setTimeout(() => {queryResult: 'yikes'}, 500)

    context = hookRequest.queryResult.outputContexts[0]

    console.log('assigned context. check data structure', context)
    console.log('hookResponse',hookResponse)
    
    response.send(hookResponse)
    hookResponse = {}
})

const matchIntent = async hookRequest => {
    let middleRequest = hookRequest.queryResult

    //switch statement connecting options
    switch (middleRequest.intent.displayName) {
        case 'Find Test Location':
            return findTest(middleRequest.parameters);
            break;
        default:
            return {
                queryResult: {
                    fulfillmentText: 'Darn it. Default again.'
                }
            }
            break;
    }

}

const findTest = location => {
    return (
        axios.get(`https://covid-19-testing.github.io/locations/${location.state.toLowerCase()}/complete.json`)
            .then(({ data }) => {
                console.log('LOCATION DATA', data)
                let siteCheck = data.find(site => site.physical_address[0].city == location.city)

                return (siteCheck.physical_address
                    ? `There's a test center at ${siteCheck.physical_address[0].address_1}.`
                    : 'No address given.'
                )
            }).catch(error => console.log('find test error', error))
    )
}


const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')