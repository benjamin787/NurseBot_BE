const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

app.options('/chatbot', cors())

const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const { WebhookClient } = require('dialogflow-fulfillment')

const dialogflow = require('@google-cloud/dialogflow')
// const { QueryParameters, QueryInput } = require('@google-cloud/dialogflow')

const uuid = require('uuid')

const project_id = process.env.PROJECT_ID

const options = {
    credentials: {
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL
        // private_key: JSON.parse(process.env.PRIVATE_KEY),
        // client_email: JSON.parse(process.env.CLIENT_EMAIL)
    },
    project_id: project_id
}

// const session_id = `${Math.floor(Math.random() * 1000) + 1}`
const session_id = uuid.v4()

const sessionClient = new dialogflow.SessionsClient(options)
const sessionPath = `projects/${project_id}/agent/sessions/${session_id}`

const configureRequest = (request) => {
    const botRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                text: request.body.message,
                languageCode: "en-US"
            }
        }
    }
    if (request.contexts && request.contexts.length > 0) {
        botRequest.queryParams ={ contexts: request.contexts }
    }
    return botRequest
}
// const configureRequest = (request) => {
//     const botRequest = {
//         session: sessionPath,
//         queryInput: QueryInput.fromObject({
//             text: {
//                 text: request.body.message,
//                 languageCode: "en-US"
//             }
//         })
//     }
//     if (request.contexts && request.contexts.length > 0) {
//         botRequest.queryParams = QueryParameters.fromObject({
//             contexts: request.contexts
//         })
//     }
//     return botRequest
// }


app.post('/chatbot', (request, response) => {
    console.log('request.body', request.body)
    console.log('response.body', response.body)
    
    response.headers = {"Access-Control-Allow-Origin": "https://covid-nurse-bot.web.app"}
    // console.log('response', response)
    // const agent = new WebhookClient({req: req, res: res})
    console.log('1')
    const agent = new WebhookClient({request: configureRequest(request), response: response})
    console.log('2')

    function fx(agent) {
        agent.add('you got this!')
    }
    let intentMap = new Map()
    console.log('3')
    intentMap.set('Default Welcome Intent', fx)
    console.log('4')
    agent.handleRequest(intentMap)
    console.log('5')
    response.status(200).end()
    console.log('6')
})


// app.post('/chatbot', (request, response) => {
//     connectToDF(request)
//         .then((response) => response.send({ message: response }))
//         .catch((error) => response.send({ 'ERROR': error}))
// })

// app.get('/', (request, response) => response.json({message: "Hello"}))

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')