const express = require("express")
const cors = require("cors")
const { default: axios } = require("axios")

const app = express()
app.use(express.json())
app.use(cors())

const posts = {}

const handleEvents = (type, data) => {
    if (type === "PostCreated") {
        const { id, title } = data
        posts[id] = { id, title, comments: [] }
    }

    if (type === "CommentCreated") {
        const { id, content, postId, status } = data
        posts[postId].comments.push({ id, content, status })
    }

    if (type === "CommentUpdated") {
        const { id, content, postId, status } = data
        const comment = posts[postId].comments.find(comment => comment.id === id)
        comment.status = status
        comment.content = content
    }
}

app.get("/posts", (req, res) => {
    res.send(posts)
})

app.post("/events", (req, res) => {
    try {
        const { type, data } = req.body
        handleEvents(type, data)
        res.send({})
    } catch (err) {
        console.log(err.message)
    }
})


app.listen(4002, async () => {
    try {
        console.log("Listening on 4002")

        const res = await axios.get("http://event-bus-srv:4005/events")

        for (const event of res.data) {
            const { type, data } = event
            console.log("Processing Event:", type)
            handleEvents(type, data)
        }

    } catch (err) {
        console.log(err.message)
    }

})
