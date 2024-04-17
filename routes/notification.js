const express = require('express')
const router = express.Router();
const { body } = require('express-validator');
const errorMiddleware = require('../middleware/error')
const BodyValidator = require('../middleware/body_validator')
const NotificationSchema = require('../models/notification')


// GET notification data
router.get('/', async (req, res, next) => {
    try {

        let raw = await NotificationSchema.find({})
        if (!raw || raw?.length === 0) {
            return res.status(404).json(null);
        }

        raw.sort((a, b) => {
            return b.createdAt - a.createdAt
        })

        return res.status(200).json(raw[0]);

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// POST notification 
router.post('/', [
    body('mess').exists().withMessage('Notification Message not found').isLength({ min: 15 }).withMessage("Message is too short"),
], BodyValidator, async (req, res, next) => {
    try {

        let raw = await new NotificationSchema({
            mess: req.body.mess,
            date: Date.now()
        }).save()

        if (raw._id) {
            return res.status(201).json(raw)
        } else {
            return res.status(400).json('Somthing went wrong')
        }

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// DELETE notification
router.delete('/', async (req, res, next) => {
    try {

        await NotificationSchema.remove({})
        return res.status(200).json('Delete Success');

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


module.exports = router