import express from 'express'
import errorMiddleware from '../middleware/error.js'
import { body } from 'express-validator';
import BodyValidator from '../middleware/BodyValidator.js'
import FeedbackSchema from '../models/workFeedback.js'
import WorkSchema from '../models/work.js'
import nodemailer from 'nodemailer'

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
            await nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAILINGADDRESS,
                    pass: process.env.MAILINGKEY
                }
            }).sendMail({
                from: process.env.MAILINGADDRESS,
                to: email,
                subject: "Thank You for Your Feedback! 🎉",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">

                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Thank You for Your Feedback!</title>
                    </head>

                    <body
                        style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
                        <div
                            style="max-width: 600px; margin: 2rem auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

                            <h1 style="color: #6a59d1; margin: 0;">Thank You for Your Feedback! 🎉</h1>
                            <p style="margin-bottom: 1em;">Dear ${name},</p>
                            <p style="margin-bottom: 1em;">Thank you for taking the time to provide your feedback! We appreciate your
                                thoughts and insights as they help us improve our services and better serve our community. 💬</p>
                            <p style="margin-bottom: 1em;">Your feedback is invaluable to us, and we want you to know that we take your
                                suggestions seriously. If you have any additional comments or questions, feel free to reach out at any time.
                                ✉️</p>
                            <p style="margin-bottom: 1em;">Stay tuned for updates, and thank you once again for being an important part of
                                our community! 🌟</p>

                            <div class="footer">
                                <table cellpadding="0" cellspacing="0"
                                    style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse; font-family: 'Comic Sans MS', cursive;">
                                    <tbody>
                                        <tr style="width: 100%;">
                                            <td>
                                                <table cellpadding="0" cellspacing="0"
                                                    style="border: none; font-size: 100%; line-height: 1; border-collapse: separate; background-color: rgb(237, 235, 249); padding: 16px; font-family: 'Comic Sans MS', cursive; border-radius: 4px;">
                                                    <tbody>
                                                        <tr style="width: 100%;">
                                                            <td style="padding-left: 0px; vertical-align: top; padding-top: 0px;">
                                                                <table cellpadding="0" cellspacing="0"
                                                                    style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td
                                                                                style="color: rgb(106, 89, 209); font-weight: bold; font-size: 153%;">
                                                                                <span>Shivam Kumar Kashyap</span>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style="padding-top: 8px; vertical-align: top;"><span
                                                                                    style="color: rgb(34, 34, 34);">MERN Stack
                                                                                    Developer</span></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                    style="border: none; font-size: 100%; line-height: 1; width: 95%; border-collapse: collapse; min-width: 95%; max-width: 95%; table-layout: fixed;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td height="1"
                                                                                                style="height: 1px; max-height: 1px; border-bottom: 1px solid rgb(106, 89, 209); line-height: 1px; padding-top: 12px;">
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                    style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="padding-top: 10px;">
                                                                                                <table cellpadding="0" cellspacing="0"
                                                                                                    style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td
                                                                                                                style="padding-right: 8px; padding-top: 10px;">
                                                                                                                <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/pgco4oo1ajc7dympzot3.svg"
                                                                                                                    alt="">
                                                                                                            </td>
                                                                                                            <td
                                                                                                                style="vertical-align: middle; padding-right: 0px; padding-top: 10px;">
                                                                                                                <span
                                                                                                                    style="color: rgb(34, 34, 34);">
                                                                                                                    <a style="text-decoration: none; color: inherit;"
                                                                                                                        href="mailto:shivamkumarkashyap12@gmail.com">shivamkumarkashyap12@gmail.com</a>
                                                                                                                </span>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td
                                                                                                                style="padding-right: 8px; padding-top: 10px;">
                                                                                                                <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/dccypkckeopxkyv39s4a.svg"
                                                                                                                    alt="" />
                                                                                                            </td>
                                                                                                            <td
                                                                                                                style="vertical-align: middle; padding-right: 0px; padding-top: 10px;">
                                                                                                                <a href="https://shivamkashyap.netlify.app/"
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer"
                                                                                                                    style="color: rgb(34, 34, 34); cursor: pointer; text-decoration: none;">https://shivamkashyap.netlify.app/</a>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                        <tr style="width: 100%;">
                                                                            <td style="padding-top: 18px;">
                                                                                <table cellpadding="0" cellspacing="0"
                                                                                    style="border: none; font-size: 100%; line-height: 1; width: auto; border-collapse: collapse;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="padding-right: 8px;">
                                                                                                <a href="https://github.com/mernwala"
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    style="display: inline-block; cursor: pointer;">
                                                                                                    <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/bnpfhg46g9ixodborvbs.svg"
                                                                                                        alt="">
                                                                                                </a>
                                                                                            </td>
                                                                                            <td style="padding-right: 8px;">
                                                                                                <a href="https://www.linkedin.com/in/shivam-kumar-kashyap-382794249"
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    style="display: inline-block; cursor: pointer;">
                                                                                                    <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/sswgmcjvl6kswxkdkwfr.svg"
                                                                                                        alt="">
                                                                                                </a>
                                                                                            </td>
                                                                                            <td style="padding-right: 8px;">
                                                                                                <a href="https://www.instagram.com/nxt_hulk/"
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    style="display: inline-block; cursor: pointer;">
                                                                                                    <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/e9ffl18onae1rhfgvsxk.svg"
                                                                                                        alt="" />
                                                                                                </a>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </body>

                    </html>
                `
            })

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