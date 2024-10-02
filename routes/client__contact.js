import express from 'express'
import nodemailer from 'nodemailer'
import { body } from 'express-validator'
import ContactSchema from '../models/contact.js'
import errorMiddleware from '../middleware/error.js'
import BodyValidator from '../middleware/BodyValidator.js'

const router = express.Router();


// 1. Route: Post contact data
router.post('/', [
    
    body('name').exists().withMessage("Name is required!").isLength({ min: 3 }),
    body('mess').exists().withMessage("Did you forgot to fill your message ?").custom((value) => {
        const endRange = 500
        if (value.length < 5 || value.length > endRange) {
            throw new Error(`Your message should be in range of 5 to ${endRange} letters!`)
        }
        return true
    }),
    body('query').exists().withMessage("Did you forgot to fill in the query input field?").custom((value) => {
        const endRange = 100
        if (value.length < 5 || value.length > endRange) {
            throw new Error(`Your query should be in range of 5 to ${endRange} letters!`)
        }
        return true
    }),
    body('email').exists().withMessage("Please provide your email so that we can contact you!").isEmail().withMessage("Input email is invalid! Please double-check your entry.")

], BodyValidator, async (req, res, next) => {

    try {
        let { name, query, mess, email } = req.body

        let data = new ContactSchema({
            "name": name,
            "query": query,
            "mess": mess,
            "email": email ? email : '',
        })
        await data.save()

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
                subject: "Thank You for Reaching Out! 😊",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">

                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Thank You for Reaching Out! 😊</title>
                    </head>

                    <body
                        style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
                        <div
                            style="max-width: 600px; margin: 2rem auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

                            <h1 style="color: #6a59d1; margin: 0;">Thank You for Reaching Out! 💬</h1>
                            <p style="margin-bottom: 1em;">Dear ${name ?? 'Valued Contact'},</p>

                            <p style="margin-bottom: 1em;">I hope this email finds you well. I wanted to take a moment to personally thank
                                you for reaching out to me. Your message has been received, and I’m thrilled to have the opportunity to
                                connect with you! 🤝</p>

                            <p style="margin-bottom: 1em;">Rest assured, I’ve received your inquiry and will respond as soon as possible. ⏳
                                In the meantime, if there’s anything urgent, feel free to contact me directly at <a
                                    href="mailto:${process.env.OWNERMAIL}">${process.env.OWNERMAIL}</a> or give me a call at <a
                                    href="tel:${process.env.OWNERPHONE}">${process.env.OWNERPHONE}</a>. 📧📞</p>

                            <p style="margin-bottom: 1em;">Thank you once again for your message! I look forward to assisting you soon. 🙌
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
                                <span style="display: block; color: #aaa; font-size: 14px;">This is an automated response to acknowledge
                                    your
                                    message. </span>
                                <span style="display: block; color: #aaa; font-size: 14px;">Feel free to reach out again if you have any
                                    immediate concerns. We're always here to help! 😊</span>
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
                    subject: "Got a Contact 😉",
                    html: `
                        From: ${email} <br />
                        Name: ${name} <br />
                        Query: ${query}
                        Mess: <br /><br />
                        ${mess}
                    `
                })
            })
        }

        return res.status(201).json("Thank you for getting in touch! We'll be in contact with you shortly.")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


export default router