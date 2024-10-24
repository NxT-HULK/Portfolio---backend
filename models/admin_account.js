import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    authority: {
        type: String,
        required: true,
        enum: {
            values: ['Admin', 'CourseWritter', 'BlogWritte'],
            message: 'Authority must be either Admin, CourseWritter, or BlogWriter'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hashPass: {
        type: String,
        required: true
    },
    recoveryToken: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Mongoose automatically creates indexes from schema options, no need to call createIndexes()
AdminSchema.index({ email: 1 });

const Account = mongoose.model('Account', AdminSchema);

export default Account;
