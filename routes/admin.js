const express = require('express')
const router = express.Router();
const fs = require('fs')
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const errorMiddleware = require('../middleware/error')

const getPassword = () => {
    try {
        const filePath = __dirname.toString().split("routes")[0].concat("key.json")
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data);
        if (jsonData && jsonData.password) {
            return jsonData.password;
        } else {
            throw new Error('Server Error');
        }
    } catch (err) {
        throw err;
    }
};

router.post('/login', [

    body('id').exists().withMessage("Admin ID is required!").isEmail().withMessage("Did you forgot you ID!"),
    body('key').exists().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password is too short!")

], (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array()[0].msg);
    }

    try {
        const LoginKey = getPassword()

        if (process.env.ADMIN_ID === req.body.id && LoginKey === req.body.key) {
            let data = {
                LoginID: process.env.ADMIN_ID,
                LoginKey: LoginKey
            }
            const token = jwt.sign(data, process.env.JWTSECRET);
            return res.status(200).json(token)
        } else {
            return res.status(400).json('Invalid Credential')
        }
    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})

router.post('/verify', async (req, res, next) => {
    try {
        let token = req.body.token
        let data = jwt.verify(token, process.env.JWTSECRET)

        let { LoginID, LoginKey } = data
        let passkey = getPassword()

        if (LoginID === process.env.ADMIN_ID && LoginKey === passkey) {
            return res.status(200).json("Admin Verified")
        } else {
            return res.status(200).json("Invalid Token")
        }
    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})

module.exports = router