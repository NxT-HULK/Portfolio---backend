import express from 'express'
import ContactSchema from '../models/contact.js'
import errorMiddleware from '../middleware/error.js'
import { AuthorityMatch__Admin } from '../middleware/VerifyAdmin.js';

const router = express.Router();


// Middleware checkup
router.use(AuthorityMatch__Admin)


// 1. Route: Get all contact data
router.get('/', async (req, res, next) => {
    try {

        let data = await ContactSchema.find({})
        return res.status(200).json(data)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// 2. Delete contact data
router.delete('/:_id', async (req, res, next) => {
    try {

        const id = req.params._id
        const deleted = await ContactSchema.findByIdAndDelete({ _id: id })

        if (deleted)
            return res.status(200).json(id)
        else
            return res.status(400).json("Unauthorize access not allowed")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
