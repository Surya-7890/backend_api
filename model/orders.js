const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    client_id: {
        type: String
    },
    foods: {
        type: Array
    }
});

module.exports = mongoose.model('orders', orderSchema);