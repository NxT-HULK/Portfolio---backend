import mongoose, { Schema } from 'mongoose';

const ContactSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    query: {
        type: String,
        required: true
    },
    mess: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Contact = mongoose.model('contact', ContactSchema)
Contact.createIndexes()

export default Contact
