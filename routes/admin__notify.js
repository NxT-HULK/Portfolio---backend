import express from 'express'
import { body } from 'express-validator'
import errorMiddleware from '../middleware/error.js'
import BodyValidator from '../middleware/BodyValidator.js'
import NotificationSchema from '../models/notification.js'
import { AuthorityMatch__Admin } from '../middleware/AuthorityVerification.js'

const router = express.Router();

// Middleware checkup
router.use(AuthorityMatch__Admin)

// POST notification 
router.post('/', [
    body('mess').exists().withMessage('Notification Message not found').isLength({ min: 15 }).withMessage("Message is too short"),
], BodyValidator, async (req, res, next) => {
    try {

        await NotificationSchema.deleteMany({})
        let raw = await new NotificationSchema({
            mess: req.body.mess,
            date: Date.now()
        }).save()

        if (raw?._id) {
            return res.status(201).json(raw)
        } else {
            return res.json(null)
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// DELETE notification
router.delete('/', async (req, res, next) => {
    try {

        await NotificationSchema.deleteMany({})
        return res.status(200).json('Delete Success')

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router