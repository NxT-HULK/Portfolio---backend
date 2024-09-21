import mongoose, { Schema } from "mongoose"

const WorkSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    shortDesc: {
        type: String,
        required: true,
    },
    html: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    background: {
        type: String,
        required: true
    },
    techUsed: {
        type: [String],
        required: true
    },
    type: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true,
        default: 9999
    },
    feedback: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'work_feedback'
    }
}, { timestamps: true })

const work = mongoose.model('work', WorkSchema)
work.createIndexes()

export default work