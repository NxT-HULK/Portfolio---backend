const mongoose = require('mongoose')
const { Schema } = mongoose;

const CoursePageSchema = new Schema({
    
    name: {
        type: String,
        require: true
    },
    page_number: {
        type: Number,
        require: true
    },
    html: {
        type: String,
        require: true
    }

}, { timestamps: true });

const course_page = mongoose.model('course_page', CoursePageSchema);
course_page.createIndexes();

module.exports = course_page;