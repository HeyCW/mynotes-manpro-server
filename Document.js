const {Schema, model} = require('mongoose');

const Document = new Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    data: {
        type: Object,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    public_access: {
        type: String,
        default: 'Restricted',
    },
    public_permission: {
        type: String,
        default: 'Viewer',
    },  
    write_access: {
        type: Array,
        default: [],
    },
    read_access: {
        type: Array,
        default: [],
    },
});

module.exports = model('Document', Document);