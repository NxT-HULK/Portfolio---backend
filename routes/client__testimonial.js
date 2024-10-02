import express from 'express'
import TestimonialSchema from '../models/testimonial.js'
import errorMiddleware from '../middleware/error.js'
import nodemailer from 'nodemailer'
import { body } from 'express-validator'
import BodyValidator from '../middleware/BodyValidator.js'

const router = express.Router();

// Get all testimonial data
router.get('/', async (req, res, next) => {
    try {

        let data = await TestimonialSchema.find({ status: true });
        return res.status(200).json(data);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// POST testiminal data and alsop send email
router.post('/', [
    body('name').exists().withMessage("Name is required!").isLength({ min: 3 }),
    body('rating')
        .exists().withMessage('Rating is required')
        .isNumeric().withMessage('Rating must be a number')
        .custom((value) => {
            const numericValue = parseFloat(value);
            if (numericValue < 1 || numericValue > 5) {
                throw new Error('Rating must be between 1 and 5');
            }
            return true;
        }),
    body('mess').exists().withMessage("Testimonial requires you words!").custom((value) => {
        const endRange = 300
        if (value.length < 5 || value.length > endRange) {
            throw new Error(`Your message should be in range of 5 to ${endRange} letters!`)
        }
        return true
    })
], BodyValidator, async (req, res, next) => {

    try {
        let { name, rating, mess, email } = req.body

        let data = new TestimonialSchema({
            "name": name,
            "rating": rating,
            "mess": mess,
            "email": email ? email : '',
        })
        data.save()

        let testimonial_id = data._id;

        if (email) {
            // Thanks and greet to recipitent
            await nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAILINGADDRESS,
                    pass: process.env.MAILINGKEY
                }
            }).sendMail({
                from: process.env.MAILINGADDRESS,
                to: email,
                subject: "Thank You for Your Wonderful Testimonial! 🌟",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">

                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Thank You for Your Wonderful Testimonial! 🌟</title>
                    </head>

                    <body
                        style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
                        <div
                            style="max-width: 600px; margin: 2rem auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

                            <h1 style="color: #6a59d1; margin: 0;">Your Feedback Means the World to Us! 🌍💬</h1>
                            <p style="margin-bottom: 1em;">Hi ${name ?? 'Valued Subscriber'},</p>
                            <p style="margin-bottom: 1em;">We hope this email finds you in good spirits! 😊 We wanted to take a moment to
                                extend a heartfelt thank you for sharing your testimonial with us. Your feedback helps us shape the future
                                of our freelancing services, and we're so grateful to have your input. 🙏</p>

                            <p style="margin-bottom: 1em;">Your kind words have not only brightened our day 🌞 but also motivate us to
                                continue delivering top-notch services that meet your expectations. Your testimonial truly makes a
                                difference! ✨</p>

                            <p style="margin-bottom: 1em;">If there’s anything else you’d like to share with us or any additional feedback,
                                we’re all ears! 👂 Feel free to reach out anytime—we love hearing from our community. 💬</p>

                            <p style="margin-bottom: 1em;">Once again, thank you for being an incredible part of our journey. 🚀 We look
                                forward to providing you with even better experiences in the future! 💪</p>

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
                                <span style="display: block; color: #aaa; font-size: 14px;">This is an automated message sent to express our
                                    deepest gratitude.</span>
                                <span style="display: block; color: #aaa; font-size: 14px;">If you'd like to share more feedback or have any
                                    questions, feel free to contact us anytime. We're here for you! 🤝</span>
                            </div>
                        </div>
                    </body>

                    </html>
                `
            }).then(async () => {
                // Verification of data via admin
                await nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.MAILINGADDRESS,
                        pass: process.env.MAILINGKEY
                    }
                }).sendMail({
                    from: process.env.MAILINGADDRESS,
                    to: process.env.OWNERMAIL,
                    subject: "Got a Testimonial 😉",
                    html: `
                        From: ${email} <br />
                        Name: ${name} <br />
                        Rating: ${rating} <br />
                        Mess: <br /><br />
                        ${mess}
                        <br/><br/>
                        
                        <big>
                            <strong>
                                <a href="${process.env.BACKENDHOST}/testimonial/update-status/${testimonial_id}">
                                    Verify Testimonial Now!
                                </a>
                            </strong>
                        </big>
                    `
                })
            })
        }

        return res.status(201).json("Your testimonial has made our day - Thank you!")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
