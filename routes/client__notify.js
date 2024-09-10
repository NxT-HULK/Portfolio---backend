import express from 'express'
import errorMiddleware from '../middleware/error.js'
import NotificationSchema from '../models/notification.js'

const router = express.Router();

// GET notification data
router.get('/', async (req, res, next) => {
    try {

        let raw = await NotificationSchema.find({})
        if (!raw || raw?.length === 0) {
            return res.status(404).json(null);
        }

        raw?.sort((a, b) => {
            return b?.createdAt - a?.createdAt
        })

        return res.status(200).json(raw[0])

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router