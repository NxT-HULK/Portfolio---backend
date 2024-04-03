const mongoose = require('mongoose')
const { Schema } = mongoose;

const CourseModule = new Schema({
    module_name: {
        type: String,
        require: true
    },
    module_number: {
        type: Number,
        require: true
    },
    pages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course_page'
    }]

}, { timestamps: true });

const course_module = mongoose.model('course_module', CourseModule);
course_module.createIndexes();

module.exports = course_module;