const dialogflow = require('dialogflow')
const axios = require('axios')

const { private_key, project_id, client_email } = process.env.GOOGLE_APPLICATION_CREDENTIALS

const config = {
    credentials: {
        private_key: private_key,
        client_email: client_email
    }
}

const languageCode = "en-US"
const session_id = `${Math.floor(Math.random() * 100) + 1}`

const sessionClient = new dialogflow.SessionsClient(config)
const sessionPath = sessionClient.sessionPath(project_id, session_id)

const connectToDF = (message) => {
    const botRequest = {
        session: sessionPath,
        queryInputs: {
            text: {
                text: message,
                languageCode
            }
        }
    }
    return (
        axios.get(sessionClient)
            .detectIntent(botRequest)
            .then((response) => {
                return response[0].queryResult
            }).catch((error) => {
                console.log('ERROR: ' + error)
            })
    )
}

module.exports = connectToDF;