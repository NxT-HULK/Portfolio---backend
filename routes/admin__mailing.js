import express from 'express'
import errorMiddleware from '../middleware/error.js'
import { body } from 'express-validator'
import NewsSchema from '../models/news_letter.js'
import nodemailer from 'nodemailer'
import BodyValidator from '../middleware/BodyValidator.js'
import { AuthorityMatch__Admin } from '../middleware/AuthorityVerification.js'

const router = express.Router();


// Middleware checkup
router.use(AuthorityMatch__Admin)


// 1. Route: Custom Mailing Service || Admin Login Require
router.post('/', [

    body('subject').exists().withMessage("Subject is required!").isLength({ min: 10 }).withMessage("Subject is too short!"),
    body('body').exists().withMessage("Body is required!").isLength({ min: 10 }).withMessage("Body is too short!"),
    body('service').exists().withMessage("Mailing Service type not defined! Check Fetch API").custom((value) => {
        let values = ["news", "custom"]
        if (values.indexOf(value) < 0) {
            throw new Error(`Who are you? Admin never forget to send service secret!`)
        }
        return true
    }),
    body('toSend').exists().withMessage("To whome you want to send mail!").isArray().withMessage("toSend should be array type").custom((val) => {
        let values = ["all", "projects", "blogs", "courses"]
        values.forEach((ele) => {
            if (values.indexOf(ele) < 0) {
                throw new Error("toSend is invalid!")
            }
        })

        return true
    })

], BodyValidator, async (req, res, next) => {
    
    try {
        if (req.body.service === "news") {
            const { toSend, subject, body } = req.body
            let counter = 0;

            await NewsSchema.find({ type: { $in: toSend }, status: true }).then(async (data) => {
                let allEmail = data?.map((ele) => {
                    return ele?.email
                })

                await nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.MAILINGADDRESS,
                        pass: process.env.MAILINGKEY
                    }
                }).sendMail({
                    from: process.env.MAILINGADDRESS,
                    to: allEmail,
                    subject: subject,
                    html: body
                })

                counter = allEmail?.length
            })

            return res.status(200).json(`Mail sent succefully to ${counter} people.`)

        } else {
            return res.status(200).json("Service coming soon!")
        }
    } catch (error) {
        if (error.message === "toSend is invalid!") {
            return res.status(400).json("toSend is invalid!")
        }

        errorMiddleware(error, req, res, next)
    }

})

export default router