import express from 'express'
import errorMiddleware from '../../../middleware/error.js'
import WorkSchema from '../../../models/work.js'

const router = express.Router()

router.get('/:type', async (req, res, next) => {
    try {

        let data = await WorkSchema.find({ type: req.params.type })
        return res.status(200).json(data)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
