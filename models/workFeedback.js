import mongoose, { Schema } from "mongoose"

const WorkFeedbackSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    remark: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    ofWork: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

const feedback = mongoose.model('work_feedback', WorkFeedbackSchema)
feedback.createIndexes()

export default feedback