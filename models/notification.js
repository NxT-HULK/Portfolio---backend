const mongoose = require('mongoose')
const { Schema } = mongoose;

const NotificationSchema = new Schema({

    mess: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true,
    }

}, { timestamps: true });

const notify = mongoose.model('notify', NotificationSchema);
notify.createIndexes();

module.exports = notify;