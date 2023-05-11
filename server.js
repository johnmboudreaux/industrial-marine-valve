const express = require('express')
const nodemailer = require('nodemailer')
const { google } = require("googleapis")
const OAuth2 = google.auth.OAuth2
const cors = require('cors')
require('dotenv').config()

const app = express()

const path = require('path')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
)

const requireHTTPS = (request, response, next) => {
    if (request.header('x-forwarded-proto') !== 'https') {
        return response.redirect(`https://${request.header('host')}${request.url}`)
    }
    next()
}

if (process.env.NODE_ENV === 'production') {
    app.use(requireHTTPS)
}

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello' })
})

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://google.com",
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    })

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            type: "OAuth2",
            user: process.env.AUTH_EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        },
    })

    return transporter
}

const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter()
    await emailTransporter.sendMail(emailOptions)
}

app.post('/api/v1/message-received', (req, res) => {
    const { city, from, name, subject, text } = req.body

    if (from && name && subject && text && !city) {
        try {
            sendEmail({
                from,
                subject,
                text,
                to: process.env.TO_EMAIL,
            })
            res.status(200).json({ message: 'Message sent' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error })
        }
    } else if (city) {
        res.status(406).json({
            success: false,
            error: 'Bot Detected',
        })
    } else {
        res.status(406).json({
            success: false,
            error: 'Missing Required Field',
        })
    }
})

app.listen(3000, () => console.log('IMV listening on port 3000!'))

module.exports = app