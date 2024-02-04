const mongoose = require('mongoose')
const { Schema } = mongoose;

const NewsLetter = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    type: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        require: true,
        default: true
    }
}, { timestamps: true });

const news = mongoose.model('news_letter', NewsLetter);
news.createIndexes();

module.exports = news;