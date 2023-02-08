const Foods = require('../model/foods');
const Orders = require('../model/orders');
const User = require('../model/users');
const express = require('express');
const router = express.Router();

router.get('/',async(req,res)=>{
    const data = await Foods.find({});
    res.json({ data });
});

router.post('/addfood',async(req,res)=>{
    const foods = new Foods();
    const { name, price } = req.body;
    try {
        foods.name = name;
        foods.price = price;
        await foods.save();
        res.json({message: "Successfully added a new item" });
    } catch (error) {
        console.log(error);
        res.json({ message: "Failed to add a new item" });
    }
});

router.get('/name=:name/finished', async(req,res)=>{
    const response = await Foods.findOneAndUpdate({ name: req.params.name },{ isAvailable: false });
    res.json({ response });
});

router.get('/name=:name/restored', async(req,res)=>{
    const response = await Foods.findOneAndUpdate({ name: req.params.name },{ isAvailable: true });
    res.json({ response });
});

router.post('/order', async(req,res)=>{
    const io = req.app.get('socket');
    const { client_id, foods, total } = req.body;
    try {
        const resp = await User.findOne({ id: client_id }, { balance: 1 });
        const balance = resp.balance - total;
        const update = await User.updateOne({ id: client_id }, { balance });
        const response = await Orders.create({ client_id, foods });
        io.emit('orderPlaced');
        res.json({ response });
    } catch (error) {
        res.json({ error: error.message })        
    }
});

router.get('/getorders', async(req, res)=> {
    const response = await Orders.find({});
    res.send(response);
})

module.exports = router;