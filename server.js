const express= require("express")();
const cors = require("cors");
const http = require("http").createServer(express);
const io = require("socket.io")(http);
const { MongoClient } = require("mongodb");
require("dotenv").config()

const client = new MongoClient(process.env.MONGODB_URI, {useUnifiedTopology:true})
const PORT = process.env.PORT || 3001;

express.use(cors());


let collection;

//socket connections & methods
io.on("connection", (socket) =>{
    socket.on("join", async(gameId)=>{
        try {
            let result = await collection.findOne({_id: gameId});
            if(!result) await collection.insertOne({_id: gameId, messages:[]})
            socket.join(gameId);
            socket.emit("joined", gameId),
            socket.activeRoom = gameId;

        } catch (e) {
            console.error(e)
        }
    });
    socket.on('message', (message)=>{
        collection.updateOne({_id: socket.activeRoom}, {
            $push: { messages: message }
        });
        io.to(socket.activeRoom).emit("message", message)
    });
})

//express routes
express.get("/chats", async (req, res)=>{
    try {
        let result = await collection.findOne({_id: request.query.room});
        res.json(result);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

//Where the server is located at
http.listen(PORT, async (req, res) =>{
    try {
        await client.connect();
        collection = client.db("liveChat").collection("chats");
        console.log(`Listening on PORT: ${PORT}`)

    } catch (e) {
        console.error(e)
    }
})
