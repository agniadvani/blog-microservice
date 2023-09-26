const { default: axios } = require("axios")
const express = require("express")

const app = express()
app.use(express.json())

const events = []

app.post("/events", async (req, res) => {
    try {
        const event = req.body
        events.push(event)

        axios.post("http://posts-clusterip-srv:4000/events", event).catch(err => console.log(err.message))
        axios.post("http://comments-srv:4001/events", event).catch(err => console.log(err.message))
        axios.post("http://query-srv:4002/events", event).catch(err => console.log(err.message))
        axios.post("http://moderation-srv:4003/events", event).catch(err => console.log(err.message))

        res.send({ status: "OK" })
    } catch (err) {
        console.log(err.message)
    }
})

app.get("/events", (req, res) => {
    try {
        res.send(events)
    } catch (err) {
        console.log(err.message)
    }
})


app.listen(4005, () => {
    console.log("Listening on 4005")
})