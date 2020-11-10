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
    console.log('request. find context', request)
    // if (contexts && contexts.length > 0) {
    //     botRequest.queryParams = {contexts: request.body.contexts};
    // }
    try {
        let botResult = await dialogClient.detectIntent(botRequest)
        botResult = botResult[0]
        console.log('botresult parameters before match',botResult.queryResult.parameters)
        console.log('botresult intent before match',botResult.queryResult.intent)

        if (botResult.queryResult.allRequiredParamsPresent) {
            console.log('match intent is hit')
            matchIntent(botResult)
        }    
        console.log('botresult after match', botResult)
        console.log('botresult parameters after match',botResult.queryResult.parameters)
        console.log('botresult intent after match',botResult.queryResult.intent)

        response.send(botResult)
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
                botResult.queryResult.fulfillmentText = `There's a test center at ${siteCheck.physical_address.address_1}.`
            }
        }).catch(error => console.log('find test error', error))
}

const matchIntent = botResult => {
    let middleIntent = botResult.queryResult.intent
    let middleParams = botResult.queryResult.parameters
    if (middleIntent.displayName == "Find Test Location") {
        console.log('intent name match is hit')
        findTest(middleParams)
    }
}

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')