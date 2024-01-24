const express = require('express');
const router = express.Router();
// TODO - remove and replce with newsletter schema
const TestimonialSchema = require('../models/testimonial');
const errorMiddleware = require('../middleware/error');
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');
const WorkSchema = require('../models/work')


// Get all work data
router.get('/', async (req, res, next) => {
    try {

        let data = await WorkSchema.find({});
        return res.status(200).json(data);


    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// Get specific work data
router.get('/get-data/:type', async (req, res, next) => {
    try {

        let data = await WorkSchema.find({ type: req.params.type });
        return res.status(200).json(data);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// POST a work data
router.post('/', [

    body('type').exists().withMessage("Type of work must be defined!").custom((value) => {
        value = value.toLowerCase()
        let arr = ["professional", "personal", "hobby"]
        if (arr.indexOf(value) === -1) {
            throw new Error('Not a valid type of work');
        }
        return true;
    }),
    body('name').exists().withMessage("Project name is required!"),
    body('shortDesc').exists().withMessage("Short Description is required").isLength({ min: 200 }).withMessage("Message is too short"),
    body('html').exists().withMessage("Modal message is required"),
    body('link').exists().withMessage("Project link is required to represent proof"),
    body('background').exists().withMessage("Background image (Card Background) is required and it should be in google drive"),
    body('techUsed').exists().withMessage("You have to mention which technology you've used").isArray({ min: 3 }).withMessage('At least three technologies must be specified'),

], async (req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array()[0].msg);
        }

        let { name, shortDesc, html, link, background, techUsed, type } = req.body

        let work = new WorkSchema({
            "name": name,
            "shortDesc": shortDesc,
            "html": html,
            "link": link,
            "background": `https://drive.google.com/uc?export=view&id=${background}`,
            "techUsed": techUsed,
            "type": type
        })

        let techStack_String = ""
        techUsed.forEach((ele) => {
            techStack_String += `- ${ele}<br/>`
        })

        let counter = 0;

        await work.save().then(async () => {
            if (false) {
                // TODO - change shema to newsletter schema
                await TestimonialSchema.find({ $expr: { $gt: [{ $strLenCP: '$email' }, 5] }, status: false }).then(async (data) => {
                    for (let i = 0; i < data.length; i++) {
                        await nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.MAILINGADDRESS,
                                pass: process.env.MAILINGKEY
                            }
                        }).sendMail({
                            from: process.env.MAILINGADDRESS,
                            to: data[i].email,
                            subject: `🚀 Exciting News! Successful Completion of Project - ${name} 🚀`,
                            html: `
                        <p style="color: #000; margin-bottom: 0;"> Dear ${data[i].name}, </p>
                        <p style="color: #000; margin-top: 0;">
                            We are thrilled to share with you the exciting news of the successful completion of our latest project,
                            <b>${name}</b> 🎉. This milestone represents a significant achievement for our team, and we are eager to share the
                            details of our hard work and dedication.
                        </p>

                        <p style="color: #000; margin-bottom: 0; font-size: 18px;"> <b>🔍 Ideation:</b> </p>
                        <p style="color: #000; margin-top: 0;">
                            The journey of ${name} began with a vision to, "${shortDesc}". We faced various challenges, navigated through
                            complexities, and emerged successful in achieving our desired outcomes. The significance of this project cannot be
                            overstated, and we are excited to showcase the results of our dedication.
                        <p>

                        <p style="color: #000; margin-bottom: 0; font-size: 18px;"> <b>🔧 Technology Stack:</b> </p>
                        ${techStack_String}

                        <p style="color: #000; margin-bottom: 0; font-size: 18px;"> <b>🌐 Project Demo:</b> </p>
                        <p style="color: #000; margin-top: 0;">Explore a demonstration of ${name} - ${link}. 🖥️ </p>

                        <p style="color: #000;">Thank you for your continued support, and we look forward to hearing your feedback on Project - ${name}.</p>

                        <p style="color: #000;">
                            Best regards, <br>
                            Shivam Kumar Kashyap <br>
                            MERN Stack Developer <br>
                        </p>

                        <span style="color: #ccc; font-size: 14px;"> This is an automated email to deliver an exciting update. </span>
                        `
                        })
                        counter++;
                    }
                })
            }
        })

        return res.status(201).json(`Work Post added. And sent mail notification to ${counter} people`)

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// delete a work data
router.delete('/:_id', async (req, res, next) => {
    try {

        await WorkSchema.findByIdAndDelete({ _id: req.params._id })
        return res.status(200).json("Data has been deleted")

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})

module.exports = router;
