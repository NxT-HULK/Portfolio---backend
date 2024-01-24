const express = require('express');
const router = express.Router();
const ContactSchema = require('../models/contact');
const errorMiddleware = require('../middleware/error');
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');


// Get all Contact data || Login Require 
router.get('/', async (req, res, next) => {
    try {

        let data = await ContactSchema.find({});
        return res.status(200).json(data);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// POST testiminal data and alsop send email
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
], async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    try {
        let { name, query, mess, email } = req.body

        let data = new ContactSchema({
            "name": name,
            "query": query,
            "mess": mess,
            "email": email ? email : '',
        })
        data.save()

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
                subject: "Thank You for Reaching Out!",
                html: `
                        <p> Dear ${name}, </p>
                        <p>
                            I hope this message finds you well. I wanted to personally express my gratitude for reaching out to me. Your message is highly appreciated, and I am thrilled to connect with you.
                        </p>
                        <p>
                            I have received your inquiry and will get back to you as soon as possible. In the meantime, if you have any urgent matters, feel free to contact me directly at <a href="mailto:${process.env.OWNERMAIL}">${process.env.OWNERMAIL}</a> or <a href="tel:${process.env.OWNERPHONE}">${process.env.OWNERPHONE}</a>.
                        </p>
                        <p>
                            Thank you once again for reaching out. I am looking forward to the opportunity to assist you.
                        </p>
                        
                        <p>
                            Best regards, <br>
                            Shivam Kumar Kashyap <br>
                            MERN Stack Developer <br>
                        </p>

                        <span style="color: #ccc; font-size: 14px;"> This is an automated email to deliver an exciting update. </span>
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
        errorMiddleware(error, req, res, next);
    }
})


// Delete via Admin || Login require
router.delete('/:_id', async (req, res, next) => {
    try {

        const id = req.params._id
        await ContactSchema.findByIdAndDelete({ _id: id })
        return res.status(200).json(id)

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


module.exports = router;
