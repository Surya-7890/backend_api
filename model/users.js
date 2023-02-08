const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: {
        type: String
    },
    balance: {
        type: Number
    },
    isLogged: {
        type: Boolean
    }
});

module.exports = mongoose.model('users', userSchema);