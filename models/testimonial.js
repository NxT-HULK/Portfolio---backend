const mongoose = require('mongoose')
const { Schema } = mongoose;

const TestimonialSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        require: true
    },
    mess: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        require: true,
        default: false
    }
}, { timestamps: true });

const ask = mongoose.model('testimonials', TestimonialSchema);
ask.createIndexes();

module.exports = ask;