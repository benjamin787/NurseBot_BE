const dialogflow = require('@google-cloud/dialogflow');

const express = require('express')
const app = express()

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,PATCH,DELETE'
}

const cors = require('cors')
app.use(cors(corsOptions))


const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.options('/chatbot', cors())

const uuid = require('uuid');
const { response } = require('express');
const axios = require('axios');
const sessionId = uuid.v4();

const options = {
    credentials: {
        "private_key": JSON.parse(process.env.PRIVATE_KEY),
        "client_email": process.env.CLIENT_EMAIL
    }
}

const projectId = process.env.PROJECT_ID



app.post('/chatbot', async (request, response) => {
    response.headers = {"Access-Control-Allow-Origin": "https://covid-nurse-bot.web.app"}

    const dialogClient = new dialogflow.SessionsClient(options);

    const sessionPath = dialogClient.projectAgentSessionPath(projectId, sessionId);

    console.log('req body', request.body)
    const botRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                text: request.body.body,
                languageCode: "en-US"
            }
        }
    }
    // if (contexts && contexts.length > 0) {
    //     botRequest.queryParams = {contexts: contexts};
    // }
    try {
        let botResult = await dialogClient.detectIntent(botRequest)
        console.log('botresult before',botResult)
        console.log('botresult parameters before',botResult[0].queryResult.parameters)
        console.log('botresult intent before',botResult[0].queryResult.intent)

        if (botResult[0].queryResult.allRequiredParamsPresent) {
            console.log('match intent is hit')
            matchIntent(botResult[0])
        }    
        console.log('botresult after', botResult)

        response.send(botResult[0])
    } catch(error) {
        console.log(error)
        response.send({message: 'blahblah'})
    }
})

const findTest = location => {
    axios.get(`https://covid-19-testing.github.io/locations/${location.state}/complete.json`)
        .then(response => response.json())
        .then(result => {
            const siteCheck = result.select(site => site.physical_address[0].city == location.city)
            console.log('siteCheck', siteCheck)
            if (siteCheck.physical_address) {
                botResult[0].queryResult.fulfillmentText = `There's a test center at ${siteCheck.physical_address.address_1}.`
            }
        }).catch(error => console.log('find test error', error))
}

// const intents = {
//     "Find Test Location": findTest
// }

const matchIntent = botResult => {
    let middleIntent = botResult.queryResult.intent
    let middleParams = botResult.queryResult.parameters
    if (middleIntent.displayName == "Find Test Location") {
        findTest(middleParams)
    }
    // const { intent, parameters } = botResult.queryResult
    // intents[intent.displayName](parameters)
}

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')