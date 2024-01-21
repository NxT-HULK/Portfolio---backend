const express = require('express');
const router = express.Router();
const TestimonialSchema = require('../models/testimonial');
const errorMiddleware = require('../middleware/error');
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');
const verifyAdmin = require('../middleware/verifyAdmin');

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
], async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

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
                subject: "Thank You for Sharing Your Testimonial! 😊",
                html: `<p> Dear ${name}, <br>
                                I hope this message finds you well. We wanted to express our sincere gratitude for taking the time to share your
                                thoughts and experiences with us. Your testimonial is incredibly valuable to our team, and we're honored to have
                                your feedback.
                            </p>
                
                            <p>
                                Your words mean a lot to us, and they play a crucial role in shaping the success of our frelancing services. We
                                appreciate your effort in providing such positive and insightful feedback.
                            </p>
                            
                            <p>
                                If you have any additional thoughts or feedback you'd like to share, please feel free to reach out to us. We're
                                always here to listen and continuously improve our offerings.
                            </p>
                            
                            <p>
                                Once again, thank you for being a part of our community and for contributing to our success. We look forward to
                                serving you and providing an even better experience in the future.
                            <p>
                            
                            <p>
                                <span> Best regards,</span> <br>
                                <span>Shivam Kashyap</span> <br>
                                <span>MERN Stack Developer</span> <br>
                                <span><a href="mailto:${process.env.OWNERMAIL}">${process.env.OWNERMAIL}</a></span> <br>
                                <span><a href="tel:${process.env.OWNERPHONE}">${process.env.OWNERPHONE}</a></span> <br>
                            <p>

                            <p><small style="color: #ccc;"> *This is system genrated mail with the server of Shivam Kashyap* </small></p>
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
        errorMiddleware(error, req, res, next);
    }
})


// Verify via Admin || Login Require
router.get('/update-status/:_id', async (req, res, next) => {
    try {

        const id = req.params._id
        await TestimonialSchema.findByIdAndUpdate({ _id: id }, { $set: { status: true } })
        return res.status(200).json("Status has been updated")

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// Delete via Admin || Login require || Current not in use
router.delete('/:_id', async (req, res, next) => {
    try {

        const id = req.params._id
        await TestimonialSchema.findByIdAndDelete({ _id: id })
        return res.status(200).json("Data has been deleted")

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// get all testimonial data
router.get('/get-all', async (req, res, next) => { 
    try {
        let data = await TestimonialSchema.find({})
        return res.status(200).json(data)
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

module.exports = router;
