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

const configureRequest = (message) => {
    return ({ 
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: "en-US"
            }
    }})
}

const connectToDF = (message) => {
    sessionClient.detectIntent(configureRequest(message))
        .then((response) => {
            return response[0].queryResult
        }).catch((error) => {
            console.log('ERROR: ' + error)
        })
}

module.exports = connectToDF;