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

const users = [];
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

const setUsers = (id, userName) => {
    const session = users.find((element, index) => {
        if (element.userName === userName) {
            return index;
        }
    });
    if (!session) {
        users.push({ id, userName })
    } else {
        console.log(session);
        users.splice(session, 1);
        users.push({ id, userName })
    }
    console.log(users)
}


io.on('connect', (socket) => {
    const id = socket.id;
    const userName = socket.handshake.auth.userName;
    setUsers(id, userName);
    socket.emit('users', users);
    socket.on('transfer', async({ id, amount }) => {
        const to = users.find(element => element.id === id)
        const receiver = await User.findOne({ id }, { balance: 1 });
        const receiver_balance = await receiver.balance + amount;
        const res2 = await User.updateOne({ id },{ balance: receiver_balance });
        if (to) {
            socket.to(to.id).emit('gotMoney');
        } 
        socket.to(socket.id).emit('sentMoney');
    })
});

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.set('socket', io);
app.use('/foods', foodsRouter);
app.use('/user', userRouter);