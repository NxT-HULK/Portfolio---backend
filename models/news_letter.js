import mongoose, { Schema } from "mongoose"

const NewsLetter = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, { timestamps: true })

const news = mongoose.model('news_letter', NewsLetter)

export default news