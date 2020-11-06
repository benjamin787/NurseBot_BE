const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const express = require('express')
const app = express()

const corsOptions = {
    origin: '*',
    methods: "GET,HEAD,PUT,POST,PATCH,DELETE"
}

const cors = require('cors')
app.use(cors(corsOptions))


const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.options('/chatbot', cors())


const options = {
    credentials: {
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL
        // private_key: JSON.parse(process.env.PRIVATE_KEY),
        // client_email: JSON.parse(process.env.CLIENT_EMAIL)
    }
}

// response.headers = {"Access-Control-Allow-Origin": "https://covid-nurse-bot.web.app"}


async function runSample() {
  // A unique identifier for the given session
    const sessionId = uuid.v4();

    const projectId = process.env.PROJECT_ID

    const sessionClient = new dialogflow.SessionsClient(options);
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);


    console.log('project id', process.env.PROJECT_ID)
    console.log('email', process.env.CLIENT_EMAIL)
    console.log('key', process.env.PRIVATE_KEY)

    const request = {
        session: sessionPath,
        queryInput: {
        text: {
            // The query to send to the dialogflow agent
            text: 'hello',
            // The language used by the client (en-US)
            languageCode: 'en-US',
        },
        },
    };

    let responses
  // Send request and log result
    try {
        responses = await sessionClient.detectIntent(request);
    } catch(error) {
        console.log('ERROR:', error)
    }
    let result
    if (responses) {
        result = responses[0].queryResult;
        console.log('Detected intent');
    }
    console.log('result', result)
    
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);

    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
    return result
}

app.post('/chatbot', (request, response) => {
    runSample()
})


const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')