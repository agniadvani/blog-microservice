const express = require("express")
const { default: axios } = require("axios")

const handleEvent = async (type, data) => {
    try {
        if (type === "CommentCreated") {
            const status = data.content.toLowerCase().includes("orange") ? "rejected" : "approved"

            await axios.post("http://event-bus-srv:4005/events", {
                type: "CommentModerated",
                data: {
                    id: data.id,
                    postId: data.postId,
                    status: status,
                    content: data.content
                }
            })
        }
    } catch (err) {
        console.log(err.message)
    }
}

const app = express()
app.use(express.json())

app.post("/events", async (req, res) => {
    try {
        const { type, data } = req.body

        await handleEvent(type, data)

    } catch (err) {
        console.log(err.message)
    }
})

app.listen(4003, async () => {
    try {
        console.log("Listening on 4003")

        const res = await axios.get("http://event-bus-srv:4005/events")

        for (const event of res.data) {
            const { type, data } = event
            console.log("Processing Event:", type)
            await handleEvent(type, data)
        }

    } catch (err) {
        console.log(err.message)
    }
})