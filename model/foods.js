const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: {
        type: String
    }
});

module.exports = mongoose.model('food', foodSchema);
/** 
* Paste one or more documents here
*/
