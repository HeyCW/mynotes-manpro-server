const {Schema, model} = require('mongoose');

const User = new Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    major: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
});

module.exports = model('User', User);