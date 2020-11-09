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
    console.log('out context', request.body.queryResult.outputContexts)
    // if (contexts && contexts.length > 0) {
    //     botRequest.queryParams = {contexts: contexts};
    // }
    try {
        let botResult = await dialogClient.detectIntent(botRequest)
        console.log('botresult',botResult)
        response.send(botResult[0])
    } catch(error) {
        console.log(error)
        response.send({message: 'blahblah'})
    }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')