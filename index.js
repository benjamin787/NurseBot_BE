const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
let jsonParser = bodyParser.json()
let urlEncoded = bodyParser.urlencoded({ extended: true })

const morgan = require('morgan')
app.use(morgan('dev'))


const connectToDF = required('./chatbot.js')

app.post('/chatbot', jsonParser, urlEncoded, (request, response, next) => {
    const message = request.body.message
    connectToDF(message)
        .then((response) => response.send({ message: response }))
        .catch((error) => response.send({ 'ERROR': error}))
})

// app.get('/hi', (request, response) => {
//     return (
//         <div>
//             <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png"/>
//             <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png"/>
//             <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png"/>
//             <link rel="manifest" href="/favicon_io/site.webmanifest"/>
//         </div>
//     )
// })

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0')