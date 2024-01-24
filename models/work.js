const mongoose = require('mongoose')
const { Schema } = mongoose;

const WorkSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    shortDesc: {
        type: String,
        require: true,
    },
    html: {
        type: String,
        require: true,
    },
    link: {
        type: String,
        require: true,
    },
    background: {
        type: String,
        require: true
    },
    techUsed: {
        type: [String],
        require: true
    },
    type: {
        type: String,
        require: true
    }
}, { timestamps: true });

const work = mongoose.model('work', WorkSchema);
work.createIndexes();

module.exports = work;