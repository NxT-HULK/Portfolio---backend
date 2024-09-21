import express from 'express'
import errorMiddleware from '../middleware/error.js'
import { body } from 'express-validator';
import BodyValidator from '../middleware/BodyValidator.js'
import FeedbackSchema from '../models/workFeedback.js'
import WorkSchema from '../models/work.js'

const router = express.Router();


// Route 1: post feedback
router.post('/', [

    body('email').exists().withMessage("Email not found").isEmail().withMessage("Not a valid email address"),
    body('name').exists().withMessage("Name not found").isLength({ min: 3 }).withMessage("Name is too short"),
    body('designation').exists().withMessage("Designation not found").isLength({ min: 3 }).withMessage("Designation is too short"),
    body('remark').exists().withMessage("Feedback message not found").isLength({ min: 25 }).withMessage("Feedback message is too short"),
    body('ofWork').exists().withMessage("ProjectID not found").isMongoId().withMessage("Not a valid project ID"),

], BodyValidator, async (req, res, next) => {
    try {

        const { email, name, designation, remark, ofWork } = req.body
        const newData = new FeedbackSchema({ email, name, designation, remark, ofWork })
        await newData.save()

        if (newData) {

            await WorkSchema.findByIdAndUpdate({ _id: ofWork }, { $push: { feedback: newData?._id } })
            
            
            // TODO - share a beatufull thanking mail for feedback
            

            
            return res.status(201).json("Thank you for your valuable feedback :-)")

        } else {
            return res.status(500).json("Server Error")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 2: Get all active feedback via projectId
router.get('/', async (req, res, next) => {
    try {

        const { projectId } = req.query
        if (projectId === null) {
            return res.status(400).json("Bad request")
        }

        const data = await FeedbackSchema.find({ ofWork: projectId, status: true })
        return res.status(200).json(data)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


export default router