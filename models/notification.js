import mongoose, { Schema } from "mongoose"

const NotificationSchema = new Schema({
    mess: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const notify = mongoose.model('notify', NotificationSchema)
notify.createIndexes()

export default notify