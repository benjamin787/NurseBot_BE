const dialogflow = require('@google-cloud/dialogflow')

const project_id = process.env.PROJECT_ID

const config = {
    credentials: {
        private_key: process.env.PRIVATE_KEY,
        client_email: process.env.CLIENT_EMAIL
    },
    project_id: project_id
}

const session_id = `${Math.floor(Math.random() * 1000) + 1}`

const sessionClient = new dialogflow.SessionsClient(config)
const sessionPath = sessionClient.projectAgentSessionPath(project_id, session_id)

const configureRequest = (request) => {
    let botRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                text: request.body.message,
                languageCode: "en-US"
            }
        }
    }
    if (request.contexts && request.contexts.length > 0) {
        botRequest.queryParams = {contexts: request.contexts}
    }
    return botRequest
}

//executeQuery called below, on detectIntent promise (2nd .then())

const connectToDF = (request) => {
    sessionClient.detectIntent(configureRequest(request))
        .then((response) => {
            return response[0].queryResult
        }).catch((error) => {
            console.log('ERROR: ' + error)
            return error
        })
}

module.exports = connectToDF;