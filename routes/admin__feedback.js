import express from 'express'
import errorMiddleware from '../middleware/error.js'
import { body } from 'express-validator';
import BodyValidator from '../middleware/BodyValidator.js'
import { AuthorityMatch__Admin } from '../middleware/AuthorityVerification.js'
import FeedbackSchema from '../models/workFeedback.js'
import WorkSchema from '../models/work.js'
import TestimonialSchema from '../models/testimonial.js'

const router = express.Router();
router.use(AuthorityMatch__Admin)


// Route 1: Get all feedback associated with project
router.get("/", async (req, res, next) => {
    try {

        const data = await WorkSchema.find({
            feedback: { $exists: true, $ne: null },
            $expr: { $gt: [{ $size: "$feedback" }, 0] }
        })

        if (data?.length === 0) {
            return res.status(404).json("No data found")
        }

        const feedbackObjectIds = data.flatMap(item => item.feedback);
        const allFeedback = await FeedbackSchema.find({ _id: { $in: feedbackObjectIds || [] } });

        return res.status(200).json({ project: data, feedback: allFeedback })

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 2: update feedback status {$set: {status: true}}
router.put('/', [

    body('feedbackId').exists().withMessage("Feedback Id not found").isMongoId().withMessage("Feedback Id is not valid"),
    body('updateFlag').exists().withMessage("Update flag not found").isBoolean().withMessage("Invalid updateFlag value"),

], BodyValidator, async (req, res, next) => {
    try {

        const { feedbackId, updateFlag } = req.body

        if (feedbackId === null) {
            return res.status(400).json("Bad request")
        }

        const update = await FeedbackSchema.findByIdAndUpdate({ _id: feedbackId }, { $set: { status: updateFlag } })
        if (update) {

            let testimonialData = new TestimonialSchema({
                "name": update?.name,
                "mess": update?.remark,
                "email": update?.email,
                "status": true,
                "rating": 0
            })

            testimonialData.save()

            return res.status(200).json(update)
        } else {
            return res.status(404).json("Project not found")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 3: Delete Feedback API
router.post('/delete', [

    body("projectId").exists().withMessage("Project ID not found").isMongoId().withMessage("Project ID is not valid"),
    body("id").exists().withMessage("Feedback ID not found").isMongoId().withMessage("Feedback ID is not valid")

], BodyValidator, async (req, res, next) => {
    try {

        const { projectId, id } = req.body;
        const deleted = await FeedbackSchema.deleteOne({ _id: id });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        await WorkSchema.findOneAndUpdate(
            { _id: projectId },
            { $pull: { feedback: id } }
        );

        return res.status(200).json("Feedback deleted successfully");

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});

export default router