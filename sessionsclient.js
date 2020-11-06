const dialogflow = require('@google-cloud/dialogflow');

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())


const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.options('/chatbot', cors())

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

const uuid = require('uuid')

const projectId = process.env.PROJECT_ID

const options = {
    credentials: {
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL
        // private_key: JSON.parse(process.env.PRIVATE_KEY),
        // client_email: JSON.parse(process.env.CLIENT_EMAIL)
    },
    projectId: projectId
}

// const session_id = `${Math.floor(Math.random() * 1000) + 1}`
const sessionId = uuid.v4()

let queries;


async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let context;
  let intentResponse;
  for (const query of queries) {
    try {
      console.log(`Sending Query: ${query}`);
      intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode
      );
      console.log('Detected intent');
      console.log(
        `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
      );
      // Use the context from this response for next queries
      context = intentResponse.queryResult.outputContexts;
    } catch (error) {
      console.log(error);
    }
  }
}
executeQueries(projectId, sessionId, queries, languageCode);