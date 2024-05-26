const express = require('express');
const router = express.Router();
const NewsSchema = require('../models/news_letter');
const errorMiddleware = require('../middleware/error');
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');

// Get all Subscriber data || Login Require 
router.get('/', async (req, res, next) => {
    try {

        let data = await NewsSchema.find({});
        return res.status(200).json(data);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


router.post('/subscribe', [

    body('name').exists().withMessage("Name is required!").isLength({ min: 3 }).withMessage("Name is too short!"),
    body('email').exists().withMessage("Eamil is required!").isEmail().withMessage("Not a valid email!"),
    body('type').exists().withMessage("Subscription type is required!").custom((value) => {
        let option = value.toLowerCase()
        let options = ["projects", "blogs", "courses", "all"]
        if (options.indexOf(option) < 0)
            throw new Error('Not a valid type of option');
        return true
    }),

], async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array()[0].msg);
    }

    try {

        let { name, email, type } = req.body
        let data = new NewsSchema({
            "name": name,
            "email": email,
            "type": type
        })
        await data.save()

        await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILINGADDRESS,
                pass: process.env.MAILINGKEY
            }
        }).sendMail({
            from: process.env.MAILINGADDRESS,
            to: email,
            subject: "Welcome to Our Newsletter Community!",
            html: `<p> Dear ${name}, <br>

            <p> We are thrilled to welcome you to our newsletter community! 🎉 Thank you for subscribing and joining our growing community of readers. </p>
            <p> By subscribing, you've ensured that you'll be the first to receive our latest updates, exclusive content, and exciting news. We can't wait to share valuable insights, stories, and offers with you. </p>
            <p> Feel free to reach out if you have any specific topics you'd like us to cover or if you have any questions. Your feedback is always appreciated. </p>
            <p> Stay tuned for our upcoming newsletters, and once again, welcome to the family!</p>

            <table cellpadding="0" cellspacing="0" border="0" width="500" style="border: none; font-size: 100%; line-height: 1; width: 500px; border-collapse: collapse; font-family: &quot;Comic Sans MS&quot;, cursive;">
            <tbody>
                <tr style="width: 100%;">
                    <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="500"
                            style="border: none; font-size: 100%; line-height: 1; width: 500px; border-collapse: separate; background-color: rgb(237, 235, 249); padding: 16px; font-family: &quot;Comic Sans MS&quot;, cursive; border-radius: 4px;">
                            <tbody>
                                <tr style="width: 100%;">
                                    <td width="484"
                                        style="width: 484px; padding-left: 0px; vertical-align: top; padding-top: 0px;">
                                        <table cellpadding="0" cellspacing="0" border="0"
                                            style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                            <tbody>
                                                <tr>
                                                    <td style="color: rgb(106, 89, 209); font-weight: bold; font-size: 153%;">
                                                        <span>Shivam Kumar Kashyap</span></td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-top: 8px; vertical-align: top;"><span
                                                            style="color: rgb(34, 34, 34);">MERN Stack Developer</span></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <table cellpadding="0" cellspacing="0" border="0"
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
                                                        <table cellpadding="0" cellspacing="0" border="0"
                                                            style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="padding-top: 10px;">
                                                                        <table cellpadding="0" cellspacing="0" border="0"
                                                                            style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td
                                                                                        style="padding-right: 8px; padding-top: 10px;">
                                                                                        <svg role="img" viewBox="0 0 40 40"
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="100%" height="20">
                                                                                            <rect x="0.5" y="0.5" width="39"
                                                                                                height="39" rx="10" fill="none"
                                                                                                stroke="#6a59d1"></rect>
                                                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                viewBox="0 0 24 24"
                                                                                                fill="#6a59d1" width="23px"
                                                                                                height="23px" x="8.5" y="8.5"
                                                                                                color="#6a59d1">
                                                                                                <path
                                                                                                    d="M19.68 20c1.414 0 2.56-1.194 2.56-2.667V10.5l-9.765 4.072a1.005 1.005 0 01-.475.095c-.232 0-.392-.034-.472-.099L1.76 10.5v6.833C1.76 18.806 2.906 20 4.32 20h15.36z">
                                                                                                </path>
                                                                                                <path
                                                                                                    d="M12 11.9l10.24-4.267v-.966C22.24 5.194 21.094 4 19.68 4H4.32C2.906 4 1.76 5.194 1.76 6.667v.966L12 11.9z">
                                                                                                </path>
                                                                                            </svg>
                                                                                        </svg>
                                                                                    </td>
                                                                                    <td
                                                                                        style="vertical-align: middle; padding-right: 0px; padding-top: 10px;">
                                                                                        <span
                                                                                            style="color: rgb(34, 34, 34);">shivamkumarkashyap12@gmail.com</span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td
                                                                                        style="padding-right: 8px; padding-top: 10px;">
                                                                                        <svg role="img" viewBox="0 0 40 40"
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="100%" height="20">
                                                                                            <rect x="0.5" y="0.5" width="39"
                                                                                                height="39" rx="10" fill="none"
                                                                                                stroke="#6a59d1"></rect>
                                                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                viewBox="0 0 24 24"
                                                                                                fill="#6a59d1" width="23px"
                                                                                                height="23px" x="8.5" y="8.5"
                                                                                                color="#6a59d1">
                                                                                                <path
                                                                                                    d="M11.767 3.166a6.411 6.411 0 019.067 9.067l-.001.001-1.716 1.717a1.558 1.558 0 11-2.204-2.204l1.717-1.717a3.295 3.295 0 10-4.659-4.66l-.002.002-1.716 1.716a1.558 1.558 0 01-2.204-2.204l1.717-1.717z">
                                                                                                </path>
                                                                                                <path
                                                                                                    d="M14.34 7.457a1.558 1.558 0 112.203 2.204l-6.864 6.863a1.558 1.558 0 01-2.203-2.203l6.863-6.864z">
                                                                                                </path>
                                                                                                <path
                                                                                                    d="M4.902 10.03a1.558 1.558 0 012.204 2.204L5.39 13.95a3.295 3.295 0 004.66 4.66l1.715-1.715a1.558 1.558 0 012.204 2.204l-1.715 1.715a6.374 6.374 0 01-4.535 1.878 6.411 6.411 0 01-4.533-10.944l1.716-1.717z">
                                                                                                </path>
                                                                                            </svg>
                                                                                        </svg>
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
                                                        <table cellpadding="0" cellspacing="0" border="0"
                                                            style="border: none; font-size: 100%; line-height: 1; width: auto; border-collapse: collapse;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="padding-right: 8px;">
                                                                        <a href="https://github.com/mernwala" target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style="display: inline-block; cursor: pointer;">
                                                                            <svg role="img" viewBox="0 0 40 40"
                                                                                xmlns="http://www.w3.org/2000/svg" width="32px">
                                                                                <rect x="0.5" y="0.5" width="39" height="39"
                                                                                    rx="100" fill="#181717" stroke="#181717">
                                                                                </rect>
                                                                                <svg role="img" viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="23px" height="23px" x="8.5" y="8.5"
                                                                                    fill="#ffffff" color="#ffffff">
                                                                                    <title>GitHub</title>
                                                                                    <path
                                                                                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
                                                                                    </path>
                                                                                </svg>
                                                                            </svg>
                                                                        </a>
                                                                    </td>
                                                                    <td style="padding-right: 8px;">
                                                                        <a href="https://www.linkedin.com/in/shivam-kumar-kashyap-382794249"
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            style="display: inline-block; cursor: pointer;">
                                                                            <svg role="img" viewBox="0 0 40 40"
                                                                                xmlns="http://www.w3.org/2000/svg" width="32px">
                                                                                <rect x="0.5" y="0.5" width="39" height="39"
                                                                                    rx="100" fill="#0A66C2" stroke="#0A66C2">
                                                                                </rect>
                                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="#ffffff" viewBox="0 0 24 24"
                                                                                    width="23px" height="23px" x="8.5" y="8.5"
                                                                                    color="#ffffff">
                                                                                    <path
                                                                                        d="M23.342 23.378h-4.76v-7.47c0-1.78-.036-4.073-2.48-4.073-2.482 0-2.86 1.938-2.86 3.942v7.601h-4.76V8.018h4.572v2.093h.061c.639-1.207 2.192-2.481 4.513-2.481 4.823 0 5.715 3.179 5.715 7.317l-.001 8.431zM3.106 5.916a2.764 2.764 0 01-2.763-2.77 2.763 2.763 0 115.527 0 2.77 2.77 0 01-2.764 2.77zm2.386 17.462H.72V8.018h4.773v15.36z">
                                                                                    </path>
                                                                                </svg>
                                                                            </svg>
                                                                        </a>
                                                                    </td>
                                                                    <td style="padding-right: 8px;">
                                                                        <a href="https://www.instagram.com/nxt_hulk/"
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            style="display: inline-block; cursor: pointer;">
                                                                            <svg role="img" viewBox="0 0 40 40"
                                                                                xmlns="http://www.w3.org/2000/svg" width="32px">
                                                                                <rect x="0.5" y="0.5" width="39" height="39"
                                                                                    rx="100" fill="#E4405F" stroke="#E4405F">
                                                                                </rect>
                                                                                <svg role="img" viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="23px" height="23px" x="8.5" y="8.5"
                                                                                    fill="#ffffff" color="#ffffff">
                                                                                    <title>Instagram</title>
                                                                                    <path
                                                                                        d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077">
                                                                                    </path>
                                                                                </svg>
                                                                            </svg>
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

            <span style="color: #ccc; font-size: 14px;"> This is an automated email to deliver an exciting update. </span>
            <span style="color: #ccc; font-size: 14px;"> Feel free to unsubscribe at any time by clicking <a href="${process.env.BACKENDHOST}/news/${email}">here</a>. Your preferences matter, and we want to ensure that you receive only the content that truly interests you. </span>
            `
        })

        return res.status(201).json("Successfully Subscribed")

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// first get confirmation via email for deletion
router.get('/:email', async (req, res, next) => {
    try {

        let path = __dirname.split("routes")[0] + "/static/ejs/unsubscribe.ejs"
        let data = {
            "frontendHost": process.env.FRONTENDHOST,
            "backendhost": process.env.BACKENDHOST,
            "email": req.params.email,
            "social": {
                "linkedin": process.env.SOCIAL_LINKEDIN,
                "insta": process.env.SOCIAL_INSTA,
                "facebook": process.env.SOCIAL_FACEBOOK,
                "github": process.env.SOCIAL_GITHUB,
                "mail": process.env.SOCIAL_MAIL,
                "resume": process.env.SOCIAL_RESUME,
            },
        }
        res.render(path, data)

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// Unsubscribe news -> Directly via user
router.post('/unsubscribe/:email', async (req, res, next) => {
    try {

        let data = await NewsSchema.findOneAndUpdate({ email: req.params.email }, { $set: { status: false } })

        if (data._id) {
            return res.status(200).json("unsubscribe done")
        } else { 
            return res.status(200).json("No Data Found")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})

module.exports = router;
