import mongoose, { Schema } from "mongoose"

const TestimonialSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true
    },
    mess: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

const Testimonial = mongoose.model('testimonials', TestimonialSchema)
Testimonial.createIndexes()

export default Testimonial