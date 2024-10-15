import mongoose, { Schema } from 'mongoose';

const CoursePageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    of_module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    page_number: {
        type: Number,
        required: true
    },
    html: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    message: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_page_message'
    }]
}, { timestamps: true })

const course_page = mongoose.model('course_page', CoursePageSchema)
course_page.createIndexes()

export default course_page