import express from 'express'
import TestimonialSchema from '../models/testimonial.js'
import errorMiddleware from '../middleware/error.js'
import { AuthorityMatch__Admin } from '../middleware/AuthorityVerification.js';

const router = express.Router();

// Middleware checkup
router.use(AuthorityMatch__Admin)


// Verify via Admin
router.get('/update-status/:_id', async (req, res, next) => {
    try {

        const id = req.params._id
        const old = await TestimonialSchema.findOne({ _id: id })
        await TestimonialSchema.findByIdAndUpdate({ _id: id }, { $set: { status: !old?.status } })
        
        return res.status(200).json(!old?.status)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Delete via Admin || Admin Login require
router.delete('/:_id', async (req, res, next) => {
    try {

        const id = req.params._id
        await TestimonialSchema.findByIdAndDelete({ _id: id })
        return res.status(200).json("Data has been deleted")

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// get all testimonial data
router.get('/get-all', async (req, res, next) => {
    try {
        let data = await TestimonialSchema.find({})
        return res.status(200).json(data)
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
