const express = require('express')
const router = express.Router();
const fs = require('fs')
const { body } = require('express-validator');
const errorMiddleware = require('../middleware/error')
const BodyValidator = require('../middleware/body_validator')


// GET notification data
router.get('/', (req, res, next) => {
    try {

        const filePath = __dirname.toString().split("routes")[0].concat("JSON/notification.json")
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        if (jsonData) {
            if (jsonData?.mess?.length > 0) {
                return res.status(200).json(jsonData)
            } else {
                return res.status(404).json('Not Found')
            }
        } else {
            return res.status(404).json('Not Found')
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// POST notification 
router.post('/', [
    body('mess').exists().withMessage('Notification Message not found').isLength({ min: 15 }).withMessage("Message is too short"),
], BodyValidator, async (req, res, next) => {
    try {

        const filePath = __dirname.toString().split("routes")[0].concat("JSON/notification.json")
        fs.writeFileSync(filePath, JSON.stringify({
            "mess": req.body.mess,
            "date": Date.now()
        }));

        let response = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(response);
        if (jsonData) {
            return res.status(201).json(jsonData)
        } else {
            return res.status(400).json('Somthing went wrong')
        }

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// DELETE notification -> Illusion for deleting file
router.delete('/', (req, res, next) => {
    try {

        const filePath = __dirname.toString().split("routes")[0].concat("JSON/notification.json")
        fs.writeFileSync(filePath, JSON.stringify({
            "mess": '',
            "date": Date.now()
        }));

        const data = fs.readFileSync(filePath, 'utf-8')
        const jsonData = JSON.parse(data)

        if (jsonData?.mess?.length === 0) {
            return res.status(200).json('Delete Success');
        } else {
            return res.status(400).json('Bad Request');
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


module.exports = router