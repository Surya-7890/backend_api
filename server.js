const express = require('express');
const app = express();
const http_server = require('http').createServer(app);
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const foodsRouter = require('./routes/foods');
const userRouter = require('./routes/users');
const User = require('./model/users');
const { Server } = require('socket.io');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open',()=> console.log(`Successfully connected to the database`));

const PORT = process.env.PORT || 7000;
http_server.listen(PORT, ()=> console.log(`Server listening on post ${PORT}`));

const io = new Server(http_server,{
    cors: {
        origin: '*'
    },
    transports:  ['websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling',
    'polling']
});

const setUsers = async(id, userName) => {
    const sessionInitiate = await User.findOneAndUpdate({ id: userName }, { sessionId: id });
}


io.on('connect', (socket) => {
    const id = socket.id;
    const userName = socket.handshake.auth.userName;
    setUsers(id, userName);
    socket.on('transfer', async({ id, amount }) => {
        console.log(id, amount)
        console.log(socket.id)
        const receiver = await User.findOne({ id }, { sessionId: 1 });
        receiver ? io.emit('found', {receiver, id, amount}) : io.emit('not found', receiver)
        receiver.sessionId ? socket.to(receiver.sessionId).emit('gotMoney'): null;
        io.to(socket.id).emit('sentMoney');
    })
});

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.set('socket', io);
app.use('/foods', foodsRouter);
app.use('/user', userRouter);