require('dotenv').config()

const express = require('express')
const twilio = require('twilio')
const v4 = require('uuid').v4
const cors = require('cors')
const Opentok = require('opentok')

const opentok = new Opentok(process.env.OPENTOK_APP_ID, process.env.OPENTOK_API_SECRET)

const app = express()

app.use(cors())

const rooms = []
let opentokSessionId = null

function getOpentokSessionId() {
  if (opentokSessionId) return Promise.resolve(opentokSessionId)

  return new Promise((resolve, reject) => {
    opentok.createSession((err, session) => {
      if (err) {
        console.log(err)
        return reject(err)
      }

      opentokSessionId = session.sessionId

      resolve(session.sessionId)
    })
  })
}

app.get('/token', (req, res) => {
  const id = v4()

  const token = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_ID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
  )

  token.identity = id

  token.addGrant(new twilio.jwt.AccessToken.VideoGrant())

  res.send({
    identity: id,
    token: token.toJwt(),
  })
})

app.get('/token-opentok', (req, res) => {
  getOpentokSessionId().then(sessionId => {
    res.send({ token: opentok.generateToken(sessionId), sessionId })
  })
})

app.get('/rooms', (req, res) => res.send(rooms))

app.get('/create-room/:roomName', (req, res) => {
  rooms.push(req.params.roomName)

  res.end()
})

app.listen(3000, () => console.log('Server listening...'))
