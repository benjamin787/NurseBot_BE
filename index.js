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
        // private_key: JSON.parse(process.env.PRIVATE_KEY),
        // client_email: JSON.parse(process.env.CLIENT_EMAIL)
    }
}

const projectId = process.env.PROJECT_ID

// response.headers = {"Access-Control-Allow-Origin": "https://covid-nurse-bot.web.app"}


app.post('/chatbot', async (request, response) => {

    const dialogClient = new dialogflow.SessionsClient(options);

    const sessionPath = dialogClient.projectAgentSessionPath(projectId, sessionId);
    // const sessionPath = dialogClient.sessionPath(projectId, sessionId);
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

    try {
        let botResult = await dialogClient.detectIntent(botRequest)
        console.log('botresult',botResult)
    } catch(error) {
        console.log(error)
    }

})
// app.post('/chatbot', (request, response) => {
//     console.log('projectId', projectId)
//     console.log('sessionId', sessionId)
//     response.json(conversationTurn(sessionId, request))
// })


// const conversationTurn = async (sessionId, data) => {
//     const dialogClient = new dialogflow.SessionsClient(options);

//     const sessionPath = dialogClient.projectAgentSessionPath(projectId, sessionId);
//     // const sessionPath = dialogClient.sessionPath(projectId, sessionId);
//     console.log('data body', data.body)
//     const botRequest = {
//         session: sessionPath,
//         queryInput: {
//             text: {
//                 text: data.body.message,
//                 languageCode: "en-US"
//             }
//         }
//     }

//     let botResult = await dialogClient.detectIntent(botRequest)
//         .then((botResult) => {
//             console.log('botresult', botResult)
//             const result = botResult[0].queryResult
//             if (result.intent) {
//                 console.log('intent', result.intent)
//             } else {
//                 console.log('no intent')
//             }
//         }).catch(error => console.log(error))
//     response.send({ do: "text query" })
    
// }


const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')