import express from 'express'
import NewsLetterSchema from '../models/news_letter.js'
import errorMiddleware from '../middleware/error.js'
import nodemailer from 'nodemailer'
import { body } from 'express-validator'
import WorkSchema from '../models/work.js'
import BodyValidator from '../middleware/BodyValidator.js'
import { AuthorityMatch__Admin } from '../middleware/AuthorityVerification.js'

const router = express.Router()


// Middleware checkup
router.use(AuthorityMatch__Admin)


// Get all work data
router.get('/', async (req, res, next) => {
    try {

        let data = await WorkSchema.find({})
        return res.status(200).json(data)


    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// POST a work data
router.post('/', [

    body('type').exists().withMessage("Type of work must be defined!").custom((value) => {
        value = value.toLowerCase()
        let arr = ["professional", "personal", "hobby"]
        if (arr.indexOf(value) === -1) {
            throw new Error('Not a valid type of work')
        }
        return true
    }),
    body('name').exists().withMessage("Project name is required!").isLength({ min: 5 }).withMessage("Project Name is too short"),
    body('shortDesc').exists().withMessage("Short Description is required").isLength({ min: 200 }).withMessage("Message is too short"),
    body('html').exists().withMessage("Modal message is required").isLength({ min: 100 }).withMessage("HTML code is too short"),
    body('link').exists().withMessage("Project link is required to represent proof").isURL().withMessage("Project link is not valid"),
    body('background').exists().withMessage("Background image (Card Background) is required and it should be in google drive").isURL().withMessage("Not a valid background URL"),
    body('techUsed').exists().withMessage("You have to mention which technology you've used").isArray({ min: 3 }).withMessage('At least three technologies must be specified'),
    body('mailFlag').exists().withMessage("MailFlag not fount").isBoolean().withMessage("Invalid mail flag value")

], BodyValidator, async (req, res, next) => {
    try {

        let { name, shortDesc, html, link, background, techUsed, type, mailFlag } = req.body

        let work = new WorkSchema({ name, shortDesc, html, link, background, techUsed, type })
        await work.save()

        let techStack_String = ""
        techUsed.forEach((ele) => {
            techStack_String += `- ${ele}<br/>`
        })

        let counter = 0
        if (mailFlag === true) {
            await NewsLetterSchema.find({ status: true, type: { $in: ['all', 'projects'] } }).then(async (data) => {
                let allEmail = data.map((ele) => {
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
                    subject: `Exciting Project Completion Update! 🎉`,
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Exciting Project Completion Update! 🎉</title>
                        </head>

                        <body
                            style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
                            <div
                                style="max-width: 600px; margin: 2rem auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

                                <h1 style="color: #6a59d1; margin: 0;">Exciting News: Project <b>${name}</b> Completed! 🎉</h1>

                                <p style="color: #000; margin-top: 1em;">
                                    Hello Subscriber,
                                </p>

                                <p style="color: #000;">
                                    We are absolutely thrilled to share the exciting news of the successful completion of our latest project,
                                    <b>${name}</b>! 🎉 This project has been a labor of love for our team, and we couldn’t wait to tell you all
                                    about it. 😊
                                </p>

                                <p style="color: #000; margin-bottom: 0; font-size: 18px;"><b>🔍 Ideation:</b></p>
                                <p style="color: #000;">
                                    The journey of ${name} began with a bold vision: "<i>${shortDesc}</i>". 💡 While the road wasn’t always
                                    easy, our team pushed through every challenge with determination, and today, we’re proud to see our hard
                                    work pay off. The impact of this project is truly something special, and we are beyond excited to showcase
                                    the results. 🚀
                                </p>

                                <p style="color: #000; margin-bottom: 0; font-size: 18px;"><b>🔧 Technology Stack:</b></p>
                                <p style="color: #000;">
                                    ${techStack_String}
                                </p>

                                <p style="color: #000; margin-bottom: 0; font-size: 18px;"><b>🌐 Project Demo:</b></p>
                                <p style="color: #000;">
                                    Experience the project in action! Explore the demo of <b>${name}</b> here: <a href="${link}"
                                        style="color: #6a59d1; text-decoration: none;">${link}</a> 🖥️
                                </p>

                                <p style="color: #000;">
                                    Thank you for your continued support. 🙏 We would love to hear your feedback on <b>Project ${name}</b>, so
                                    please don't hesitate to share your thoughts! 💬 
                                </p>

                                <p style="color: #000; text-align: center;">
                                    <a href="https://shivamkashyap.netlify.app/#/feedback?projectId=${work?._id}" 
                                    style="padding: 10px 20px; background-color: #6a59d1; color: #fff; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Share Your Feedback
                                    </a>
                                </p>

                                <p style="color: #000;">
                                    Your insights help us grow and improve, and we truly value your input! 🌟
                                </p>

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

                                <div style="margin-top: 1rem;">
                                    <span style="display: block; color: #aaa; font-size: 14px;">This is an exciting update about our latest
                                        project completion.</span>
                                    <span style="display: block; color: #aaa; font-size: 14px;">We look forward to hearing your thoughts and
                                        continuing this journey with you. 🌟</span>
                                </div>
                            </div>
                        </body>

                        </html>
                    `
                })

                counter = allEmail?.length
            })
        }

        if(mailFlag === true) {
            return res.status(201).json(`Work Post added and mail to: ${counter} people`)
        } else {
            return res.status(201).json("Work Posting success")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
        console.log('PROJECT SECTION ERROR', error)
    }
})


// delete a work data || Admin Login Require
router.delete('/:_id', async (req, res, next) => {
    try {

        let deleted = await WorkSchema.findByIdAndDelete({ _id: req.params._id })
        if (deleted)
            return res.status(200).json("Data has been deleted")
        else
            return res.status(404).json("Unauthorize access not allowed")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// setting up order of project
router.post('/change-order', [

    body('order').exists().withMessage("Work order not found").custom((val) => {
        if (val > 0) {
            return true
        }

        throw new Error("Negative and zero value not allowed!")
    }),
    body('_id').exists().withMessage("Project ID not found").isMongoId().withMessage("Unauthorize access not allowed")

], BodyValidator, async (req, res, next) => {
    try {

        let { order, _id } = req.body

        await WorkSchema.findByIdAndUpdate(
            { _id: _id },
            { $set: { order: order } }
        )

        let data = await WorkSchema.findOne({ _id: _id })

        if (data.order === order * 1) {
            return res.status(200).json(data)
        } else {
            return res.status(400).json("Bad Request")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


export default router
