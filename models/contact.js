const mongoose = require('mongoose')
const { Schema } = mongoose;

const ContactSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    query: {
        type: String,
        require: true
    },
    mess: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    }
}, { timestamps: true });

const contact = mongoose.model('contact', ContactSchema);
contact.createIndexes();

module.exports = contact;