import express from 'express'
import NewsSchema from '../models/news_letter.js'
import errorMiddleware from '../middleware/error.js'
import nodemailer from 'nodemailer'
import { body } from 'express-validator'
import BodyValidator from '../middleware/BodyValidator.js'

const router = express.Router();

// Route 1: NEWS letter subscription
router.post('/', [

    body('name').exists().withMessage("Name is required!").isLength({ min: 3 }).withMessage("Name is too short!"),
    body('email').exists().withMessage("Eamil is required!").isEmail().withMessage("Not a valid email!"),
    body('type').exists().withMessage("Subscription type is required!").custom((value) => {
        let option = value.toLowerCase()
        let options = ["projects", "blogs", "courses", "all"]
        if (options.indexOf(option) < 0)
            throw new Error('Not a valid type of option');
        return true
    }),

], BodyValidator, async (req, res, next) => {

    try {

        let { name, email, type } = req.body
        let oldCheck = await NewsSchema.findOne({ email })

        if (oldCheck) {
            await NewsSchema.findOneAndUpdate({ email }, { $set: { status: true, name: name, type: type } })
        } else {
            let data = new NewsSchema({
                "name": name,
                "email": email,
                "type": type
            })

            await data.save()
        }

        await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILINGADDRESS,
                pass: process.env.MAILINGKEY
            }
        }).sendMail({
            from: process.env.MAILINGADDRESS,
            to: email,
            subject: "Welcome to Our Newsletter Community! 🎉",
            html: `
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Our Newsletter!</title>
            </head>

            <body
                style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
                <div
                    style="max-width: 600px; margin: 2rem auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

                    <h1 style="color: #6a59d1; margin: 0;">Welcome to Our Newsletter! 🎉</h1>
                    <p style="margin-bottom: 1em;">Dear ${name ?? 'Subscriber'},</p>
                    <p style="margin-bottom: 1em;">We are excited to have you join our community! Thank you for subscribing to our
                        newsletter where you'll receive regular updates on:</p>

                    <ul style="margin-bottom: 1em; padding-left: 1.2em;">
                        <li><strong>🚀 Completed Projects:</strong> Get insights into our latest projects and how we're pushing
                            boundaries in tech.</li>
                        <li><strong>📚 Technical Courses:</strong> Learn from our tutorials and courses, including in-depth guides
                            on React.js, SDLC, and more.</li>
                        <li><strong>📝 Blog Posts:</strong> Stay informed with new articles covering the latest trends, best
                            practices, and industry tips.</li>
                    </ul>

                    <p style="margin-bottom: 1em;">As a valued subscriber, you’ll be the first to know about:</p>
                    <ul style="margin-bottom: 1em; padding-left: 1.2em;">
                        <li>🌟 New Project Launches</li>
                        <li>🎓 Upcoming Courses & Tutorials</li>
                        <li>📝 Exclusive Blog Content</li>
                        <li>🔔 Special Offers & Announcements</li>
                    </ul>

                    <p style="margin-bottom: 1em;">We’re thrilled to have you with us and can't wait to share valuable content to
                        help you stay ahead in the tech world!</p>

                    <p style="margin-bottom: 1em;">Thank you for subscribing, and welcome aboard!</p>

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
                                                                                                        <img src="./email.svg"
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
                                                                                                        <img src="./website.svg"
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
                                                                                            <img src="./github.svg" alt="">
                                                                                        </a>
                                                                                    </td>
                                                                                    <td style="padding-right: 8px;">
                                                                                        <a href="https://www.linkedin.com/in/shivam-kumar-kashyap-382794249"
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            style="display: inline-block; cursor: pointer;">
                                                                                            <img src="./linkedin.svg" alt="">
                                                                                        </a>
                                                                                    </td>
                                                                                    <td style="padding-right: 8px;">
                                                                                        <a href="https://www.instagram.com/nxt_hulk/"
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            style="display: inline-block; cursor: pointer;">
                                                                                            <img src="./insta.svg" alt="" />
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

                    <div style="margin-top: 1rem;">
                        <span style="display: block; color: #aaa; font-size: 14px;">This is an automated email to deliver exciting
                            updates.</span>
                        <span style="display: block; color: #aaa; font-size: 14px;">Feel free to unsubscribe at any time by clicking
                            <a href="${process.env.FRONTENDHOST}/#/unsubscribe?email=${email}"
                                style="color: #6a59d1; text-decoration: none;">here</a>. We respect your preferences and want to
                            ensure
                            you only receive content that truly interests you.</span>
                    </div>
                </div>
            </body>

            </html>
            `
        })

        return res.status(201).json("Successfully Subscribed")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 2: Unsubscribe news -> Directly via user
router.post('/unsubscribe', [
    body('email').exists().withMessage("Email not found").isEmail().withMessage("Not a valid email")
], BodyValidator, async (req, res, next) => {
    try {
        const data = await NewsSchema.findOneAndUpdate({ email: req.body.email }, { $set: { status: false } })
        if (data) {
            return res.status(200).json("unsubscribe done")
        } else {
            return res.status(404).json("Given email not found in list")
        }
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
