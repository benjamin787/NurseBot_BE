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



// const conversationTurn = (data) => {
    

//     console.log('projectId', projectId)
//     console.log('sessionId', sessionId)
    
//     const dialogClient = new dialogflow.SessionsClient(options);

//     const sessionPath = dialogClient.projectAgentSessionPath(projectId, sessionId);


//     const request = {
//         session: sessionPath,
//         queryInput: {
//             text: {
//                 text: data,
//                 languageCode: 'en-US',
//             },
//         },
//     };

    

//     // const botResponse = dialogClient.detectIntent(request)
//     return dialogClient.detectIntent(request)
//         .then(response => response.json())
//         // .then(response => {
//         //     console.log('response in DI', response[0].queryResult)
//         //     return response[0].queryResult
//         // })
//         // .then(response => response[0].queryResult)
//         .catch(error => {
//             console.log('ERROR', error)
//         })
        
//     // console.log('botResponse', botResponse)
    
//     // return botResponse
        
//         // Send request and log result
//     // try {
//     //     responses = await sessionClient.detectIntent(request);
//     // } catch(error) {
//     //     console.log('ERROR:', error)
//     // }
//     // let result
//     // if (responses) {
//     //     result = responses[0].queryResult;
//     //     console.log('Detected intent');
//     // }
//     // console.log('result', result)
    

//     // if (result.intent) {
//     //     console.log(`  Intent: ${result.intent.displayName}`);
//     // } else {
//     //     console.log(`  No intent matched.`);
//     // }
//     // return result
// }

app.post('/chatbot', (request, response) => {
    console.log('projectId', projectId)
    console.log('sessionId', sessionId)
    response.send(conversationTurn(sessionId, request))
})
    // const dialogClient = new dialogflow.SessionsClient(options);

    // const sessionPath = dialogClient.projectAgentSessionPath(projectId, sessionId);


    // const data = {
    //     session: sessionPath,
    //     queryInput: {
    //         text: {
    //             text: request.body.message,
    //             languageCode: 'en-US',
    //         },
    //     },
    // };

    // let returnMessage

    // dialogClient.detectIntent(data, response)
    //     .then((results) => {
    //         response.json(results)
    //         console.log('response', response)
    //         console.log('results', results)
    //     })

    //     .catch(error => console.log('ERROR', error))
        
    // conversationTurn(request)
    //     .then(response => console.log('response in post', response))
    //     .catch(error => console.log('ERROR', error))


const conversationTurn = async (sessionId, data) => {
    const dialogClient = new dialogflow.SessionsClient(options);

    const sessionPath = dialogClient.projectAgentSessionPath(projectId, sessionId);
    // const sessionPath = dialogClient.sessionPath(projectId, sessionId);

    const botRequest = {
        session: sessionPath,
        input: {
            text: {
                text: data,
                languageCode: "en-US"
            }
        }
    }

                                        // "queryInput": {
    let answer
    try {
        // answer = await dialogClient.detectIntent(JSON.stringify(botRequest))
        answer = await dialogClient.detectIntent(botRequest)
        console.log('response id', answer.response_id)
    } catch(error) {
        console.log('ERROR', error)
    }
    return answer
}


const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')