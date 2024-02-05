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

            <p>
                <span> Best regards,</span> <br>
                <span>Shivam Kashyap</span> <br>
                <span>MERN Stack Developer</span> <br>
                <span><a href="mailto:${process.env.OWNERMAIL}">${process.env.OWNERMAIL}</a></span> <br>
                <span><a href="tel:${process.env.OWNERPHONE}">${process.env.OWNERPHONE}</a></span> <br>
            <p>

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
