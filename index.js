const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');
const app = express();

const route = require('./route')
const {addUser, findUser, getRoomUsers, removeUser} = require("./users");

app.use(cors({origin: "*"}))
app.use(route)

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    socket.on('join', ({name,room})=>{
        socket.join(room)

        const {user, isExist} = addUser({name,room})

        const userMessage = isExist ? `${user.name}, hey you go again` : `Hey ${user.name}`

        socket.emit('message',{
            data: {
                user: {name:'Admin'},
                message: userMessage,
            }
        })
        socket.broadcast.to(user.room).emit('message',{
            data: {
                user: {name:'Admin'},
                message: `${user.name} has joined`,
            }
        })

        io.to(user.room).emit('joinRoom', {data:{users: getRoomUsers(user.room)}})
    })

    socket.on('sendMessage', ({messageValue, params})=>{
        const user = findUser(params)
        if (user){
            io.to(user.room).emit('message', {data: {user, message: messageValue}})
        }
    })

    socket.on('leftRoom', ({params})=>{
        const user = removeUser(params)
        if (user){
            const {room, name} = user
            io.to(room).emit('message', {data: {user: {name: 'Admin'}, message: `${name} has left`}})

            io.to(room).emit('joinRoom', {data:{users: getRoomUsers(room)}})
        }
    })

    io.on('disconnect', () => {
        console.log('Disconnect')
    })
})

server.listen(5000, () => {
    console.log('Server is running')
})