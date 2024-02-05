const express = require('express')
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin')
const errorMiddleware = require('../middleware/error');
const { body, validationResult } = require('express-validator');
const NewsSchema = require('../models/news_letter')
const nodemailer = require('nodemailer')

// Custom Mailing Service || Login Require
router.post('/', verifyAdmin, [

    body('subject').exists().withMessage("Subject is required!").isLength({ min: 10 }).withMessage("Subject is too short!"),
    body('body').exists().withMessage("Body is required!").isLength({ min: 10 }).withMessage("Body is too short!"),
    body('service').exists().withMessage("Mailing Service type not defined! Check Fetch API").custom((value) => {
        let values = ["news", "custom"]
        if (values.indexOf(value) < 0) {
            throw new Error(`Who are you? Admin never forget to send service secret!`);
        }
        return true;
    }),

], async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array()[0].msg);
    }

    try {

        if (req.body.service === "news") {

            const { toSend, subject, body } = req.body
            let counter = 0;

            // custom validation of toSend array from req.body
            if (!toSend) {
                return res.status(400).json("To whome you want to send mail!")
            } else {
                if (!Array.isArray(toSend)) {
                    return res.status(400).json("toSend should be array type")
                } else {
                    let values = ["all", "projects", "blogs", "courses"]
                    toSend.forEach((ele) => {
                        if (values.indexOf(ele) < 0) {
                            throw new Error("toSend is invalid!")
                        }
                    })
                }
            }

            await NewsSchema.find({
                
                type: { $in: toSend },
                status: true
                
            }).then(async (data) => {
                for (let i = 0; i < data.length; i++) {
                    let curr = data[i]
                    await nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.MAILINGADDRESS,
                            pass: process.env.MAILINGKEY
                        }
                    }).sendMail({
                        from: process.env.MAILINGADDRESS,
                        to: curr.email,
                        subject: subject,
                        html: body
                    })

                    counter++;
                }
            })

            return res.status(200).json(`Mail sent succefully to ${counter} people.`)

        } else {
            return res.status(200).json("Service coming soon!")
        }

    } catch (error) {
        
        if (error.message === "toSend is invalid!") { 
            return res.status(400).json("toSend is invalid!")
        }

        errorMiddleware(error, req, res, next);
    }

})

module.exports = router