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
    },
    sessionId: {
        type: String
    }
});

module.exports = mongoose.model('users', userSchema);