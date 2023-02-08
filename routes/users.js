const express = require('express');
const router = express.Router();
const User = require('../model/users');
const jwt = require('jsonwebtoken');

const maxAge = 7 * 24 * 60 * 60;

router.post('/', async(req,res) => {
    const id = req.body.id;
    const data = await User.find({ id }, { id: 1 });
    if (data.length === 0) {
        const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
            expiresIn: maxAge
        });
        const user = await User.create({ balance: 500, id });
        res.json({ user, token });
    } else {
        res.json({ message: 'Already Logged in Another Device' });
    }
});

router.post('/transfer', async(req,res)=>{
    const io = req.app.get('socket');
    const { from, to, amount } = req.body;
    try {
        const sender = await User.findOne({ id: from }, { balance: 1 });
        const receiver = await User.findOne({ id: to }, { balance: 1 });
        console.log(sender, receiver);
        const receiver_balance = await receiver.balance + amount;
        const sender_balance = await sender.balance - amount;
        const res1 = await User.updateOne({ id: from },{ balance: sender_balance });
        const res2 = await User.updateOne({ id: to },{ balance: receiver_balance });
        io.emit(`reduce`, props={amount, from} );
        io.emit(`add`, props={amount, to} );
        res.json({ res1, res2 });
    } catch (error) {
        res.json({ error });
    }
});

router.get('/getInfo/:token', async(req,res)=>{
    const token = req.params.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, decodedToken) => {
            if (error) {
                res.json({ error: error.message });
            } else {
                console.log(decodedToken);
                const user = await User.findOne({ id: decodedToken.id });
                res.json({ user });
            }
        });
    }
});

module.exports = router;