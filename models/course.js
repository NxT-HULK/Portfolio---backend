import mongoose, { Schema } from 'mongoose'

const CourseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true
    },
    usedTech: {
        type: [String],
        required: true
    },
    information: {
        type: String,
        required: true
    },
    welcome_screen: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_module'
    }],
}, { timestamps: true })

const course = mongoose.model('course', CourseSchema)
course.createIndexes()

export default course