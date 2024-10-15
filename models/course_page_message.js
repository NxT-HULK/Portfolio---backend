import mongoose, { Schema } from 'mongoose';

const CoursePageDoubtSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    repository: {
        type: String,
    },
    mess: {
        type: String,
        required: true
    },
    reply: {
        type: String
    },
    ofPage: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const course_page_message = mongoose.model('course_page_message', CoursePageDoubtSchema)
course_page_message.createIndexes()

export default course_page_message