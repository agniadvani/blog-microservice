const express = require("express")
const crypto = require("crypto")
const cors = require("cors")
const { default: axios } = require("axios")

const app = express()

app.use(express.json())
app.use(cors())

const commentsByPostId = {}

app.get("/posts/:id/comments", (req, res) => {
    try {
        res.send(commentsByPostId[req.params.id] || [])
    } catch (err) {
        console.log(err.message)
    }
})

app.post("/posts/:id/comments", async (req, res) => {
    try {
        const commentId = crypto.randomBytes(4).toString('hex')
        const postId = req.params.id
        const comments = commentsByPostId[postId] || []
        comments.push({ id: commentId, content: req.body.content, status: "pending" })
        commentsByPostId[postId] = comments

        await axios.post("http://event-bus-srv:4005/events", { type: "CommentCreated", data: { id: commentId, content: req.body.content, postId: postId, status: "pending" } })

        res.status(201).send(comments)
    } catch (err) {
        console.log(err.message)
    }
})

app.post("/events", async (req, res) => {
    try {
        console.log("Event Recieved:", req.body.type)
        const { type, data } = req.body

        if (type === "CommentModerated") {
            const { id, postId, status } = data
            const comments = commentsByPostId[postId]
            const comment = comments.find(comment => {
                return comment.id === id
            })
            comment.status = status
            await axios.post("http://event-bus-srv:4005/events", { type: "CommentUpdated", data: { id, postId, content: data.content, status } })
        }
        res.send({})

    } catch (err) {
        console.log(err.message)
    }
})


app.listen("4001", () => {
    console.log("Listening on 4001")
})