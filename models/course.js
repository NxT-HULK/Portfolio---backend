const mongoose = require('mongoose')
const { Schema } = mongoose;

const CourseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        require: true
    },
    usedTech: {
        type: [String],
        require: true
    },
    information: {
        type: String,
        require: true
    },
    welcome_screen: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: false
    },
    modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_module'
    }],
}, { timestamps: true });

const course = mongoose.model('course', CourseSchema);
course.createIndexes();

module.exports = course;