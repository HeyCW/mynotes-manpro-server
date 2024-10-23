const {Schema, model} = require('mongoose');

const Comment = new Schema({
    _id: {
        type: String,
        required: true,
    },
    document_id: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Comment', Comment);