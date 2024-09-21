import express from 'express'
import errorMiddleware from '../middleware/error.js'
import WorkSchema from '../models/work.js'
import FeedbackSchema from '../models/workFeedback.js'

const router = express.Router()


// Route 1: Get work data according to their type
router.get('/:type', async (req, res, next) => {
    try {

        let data = await WorkSchema.find({ type: req.params.type })
        return res.status(200).json(data)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 2: Get word data via their id
router.get('/', async (req, res, next) => {
    try {

        const { projectId } = req.query
        let data = await WorkSchema.findOne({ _id: projectId })
        if (!data) {
            return res.status(404).json("No data found with assigned id")
        }

        return res.status(200).json(data)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
