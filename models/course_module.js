import mongoose, { Schema } from 'mongoose';

const CourseModule = new Schema({
    module_name: {
        type: String,
        required: true
    },
    of_course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    module_number: {
        type: Number,
        required: true
    },
    pages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_page'
    }]

}, { timestamps: true })

const course_module = mongoose.model('course_module', CourseModule)
course_module.createIndexes()

export default course_module