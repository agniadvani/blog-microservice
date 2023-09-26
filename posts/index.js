const express = require("express")
const crypto = require("crypto")
const cors = require("cors")
const { default: axios } = require("axios")

const app = express()
app.use(express.json())
app.use(cors())

const posts = {}

app.get("/posts", (req, res) => {
    try {
        res.send(posts)
    } catch (err) {
        console.log(err.message)
    }
})

app.post("/posts/create", async (req, res) => {
    try {
        const id = crypto.randomBytes(4).toString('hex')
        const { title } = req.body
        posts[id] = { id, title }

        await axios.post("http://event-bus-srv:4005/events", { type: "PostCreated", data: { id, title } })

        res.status(201).send(posts[id])
    } catch (err) {
        console.log(err.message)
    }
})

app.post("/events", (req, res) => {
    try {
        console.log("Event Recieved:", req.body.type)
        res.send({})
    } catch (err) {
        console.log(err.message)
    }
})


app.listen(4000, () => {
    console.log("v3500")
    console.log("Listening on 4000")
})