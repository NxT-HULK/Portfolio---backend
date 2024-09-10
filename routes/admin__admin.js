// TODO - Account recovery code is pending
import express from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import errorMiddleware from '../middleware/error.js'
import BodyValidator from '../middleware/BodyValidator.js'
import AdminSchema from '../models/admin_account.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { VerifySuperAdmin } from '../middleware/VerifyAdmin.js'

const router = express.Router();


// Route 1: Supper admin login via .env (MASTER_PASS) password
router.post('/', [
    body("email").optional().isEmail().withMessage("Not a valid Id").custom((value) => {
        if (value !== process.env.MASTER_ID) throw new Error("Unauthorized access not allowed");
        return true;
    }),
    body("password").optional().custom((value) => {
        if (value !== process.env.MASTER_PASS) throw new Error("Incorrect Password");
        return true;
    })
], BodyValidator, async (req, res, next) => {
    try {

        const { authToken } = req.cookies;
        if (!authToken) {
            let { email, password } = req.body
            if (email === process.env.MASTER_ID && password === process.env.MASTER_PASS) {
                const data = {
                    email: email,
                    authority: 'SupperAdmin'
                }

                const token = await jwt.sign(data, process.env.JWTSECRET)
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    priority: 'High'
                });

                return res.status(200).json("Login Success");
            } else {
                return res.status(400).json("User ID or Password incorrect");
            }
        } else {
            const data = await jwt.verify(authToken, process.env.JWTSECRET);
            if (data?.email === process.env.MASTER_ID && data?.authority === 'SupperAdmin') {
                const token = await jwt.sign(data, process.env.JWTSECRET)
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    priority: 'High'
                });

                return res.status(200).json("Login Success");
            } else {
                return res.status(400).json("Unauthorized");
            }
        }

    } catch (error) {
        return errorMiddleware(error, req, res, next);
    }
});


router.get('/get-all', VerifySuperAdmin, async (req, res, next) => {
    try {

        let acc = await AdminSchema.find({})

        if (acc?.length === 0) return null
        return res.status(200).json(acc)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 2: Account Creation via Admin [Admin & CourseWritter & BlogWritter ] || Supper Admin login require
router.post('/signup', VerifySuperAdmin, [
    body('email').exists().withMessage("Id not found").isEmail().withMessage("Not a valid type of Id"),
    body('name').exists().withMessage("Name not found").isLength({ min: 3 }).withMessage("Not a valid name"),
    body('password').exists().withMessage("Password not found").isLength({ min: 6 }).withMessage("Password is not validated"),
    body('authority').exists().withMessage("Authority level not defined").custom((value) => {
        const arr = ['Admin', 'CourseWritter', 'BlogWritter']
        if (arr.indexOf(value) === -1) {
            throw new Error("Invalid authority level")
        }
        return true
    })
], BodyValidator, async (req, res, next) => {
    try {

        const { email, name, password, authority } = req.body

        let old = await AdminSchema.findOne({ email })
        if (old) {
            return res.status(400).json("Id with this email already exist!")
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new AdminSchema({ name, authority, email, hashPass: hashedPassword })
        await newUser.save()

        // verification mail send to user [nodemailer]
        let mail = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILINGADDRESS,
                pass: process.env.MAILINGKEY
            }
        }).sendMail({
            from: process.env.MAILINGADDRESS,
            to: email,
            subject: "Welcome Greet",
            html: `
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Shivam Kashyap - Course Offer Email</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                    }

                    .container {
                        width: 100%;
                        background-color: #f7f7f7;
                        padding: 20px 0;
                    }

                    .content {
                        background-color: #ffffff;
                        margin: 0 auto;
                        padding: 20px;
                        max-width: 600px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }

                    h1 {
                        color: #6a59d1;
                    }

                    p {
                        line-height: 1.5;
                        margin: 10px 0;
                    }

                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #6a59d1;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        cursor: pointer
                    }

                    .signature {
                        margin-top: 30px;
                    }

                    .footer {
                        margin-top: 40px;
                        font-size: 0.9em;
                        color: #777777;
                    }
                </style>
            </head>

            <body>
                <div class="container">
                    <div class="content">
                        <h1>Dear ${name},</h1>
                        <p>We are pleased to inform you that you have been selected for the part-time course writing job at
                            <strong>Shivam Kashyap</strong>.
                        </p>
                        <p>As part of this role, you will be responsible for creating engaging and informative course content for
                            our platform. This is an exciting opportunity to contribute to the learning community while enhancing
                            your own skills.</p>
                        <p><strong>Job details:</strong></p>
                        <ul>
                            <li>Position: ${authority}</li>
                            <li>Location: Remote</li>
                            <li>Start Date: As soon as possible</li>
                        </ul>
                        <p>We believe that your knowledge and expertise will greatly benefit our team. Please click the link below
                            to confirm your acceptance of this offer and get started with the onboarding process.</p>
                        
                        <p>
                            <a href="${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}" class="button">Activate Account</a>
                        </p>
                        
                        <p>
                            You can copy and past the below link if above button is not working <br />
                            <span style="padding: 10px; background: #222; display: block;">
                                <a style="color: #fff; text-decoration: none;" href="${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}" target="_blank" rel="noopener noreferrer">
                                    ${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}
                                </a>
                            </span>
                        </p>
                        <p>If you have any questions, feel free to reach out to us. We look forward to working with you!</p>
                        <div class="signature">
                            <table cellpadding="0" cellspacing="0" border="0" width="500"
                                style="border: none; font-size: 100%; line-height: 1; width: 500px; border-collapse: collapse;">
                                <tbody>
                                    <tr style="width: 100%;">
                                        <td>
                                            <table cellpadding="0" cellspacing="0" border="0" width="500"
                                                style="border: none; font-size: 100%; line-height: 1; width: 500px; border-collapse: separate; background-color: rgb(237, 235, 249); padding: 16px;  border-radius: 4px;">
                                                <tbody>
                                                    <tr style="width: 100%;">
                                                        <td width="484"
                                                            style="width: 484px; padding-left: 0px; vertical-align: top; padding-top: 0px;">
                                                            <table cellpadding="0" cellspacing="0" border="0"
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
                                                                                            <table cellpadding="0" cellspacing="0"
                                                                                                border="0"
                                                                                                style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td
                                                                                                            style="padding-right: 8px; padding-top: 10px;">
                                                                                                            <svg role="img"
                                                                                                                viewBox="0 0 40 40"
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                width="100%"
                                                                                                                height="20">
                                                                                                                <rect x="0.5"
                                                                                                                    y="0.5"
                                                                                                                    width="39"
                                                                                                                    height="39"
                                                                                                                    rx="10"
                                                                                                                    fill="none"
                                                                                                                    stroke="#6a59d1">
                                                                                                                </rect>
                                                                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                                    viewBox="0 0 24 24"
                                                                                                                    fill="#6a59d1"
                                                                                                                    width="23px"
                                                                                                                    height="23px"
                                                                                                                    x="8.5" y="8.5"
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
                                                                                                            <a style="text-decoration: none;"
                                                                                                                href="mailto:shivamkumarkashyap12@gmail.com">
                                                                                                                <span
                                                                                                                    style="color: rgb(34, 34, 34);">shivamkumarkashyap12@gmail.com</span>
                                                                                                            </a>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td
                                                                                                            style="padding-right: 8px; padding-top: 10px;">
                                                                                                            <svg role="img"
                                                                                                                viewBox="0 0 40 40"
                                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                                width="100%"
                                                                                                                height="20">
                                                                                                                <rect x="0.5"
                                                                                                                    y="0.5"
                                                                                                                    width="39"
                                                                                                                    height="39"
                                                                                                                    rx="10"
                                                                                                                    fill="none"
                                                                                                                    stroke="#6a59d1">
                                                                                                                </rect>
                                                                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                                    viewBox="0 0 24 24"
                                                                                                                    fill="#6a59d1"
                                                                                                                    width="23px"
                                                                                                                    height="23px"
                                                                                                                    x="8.5" y="8.5"
                                                                                                                    color="#6a59d1">
                                                                                                                    <path
                                                                                                                        d="M11.767 3.166a6.411 6.411 0 019.067 9.067l-.001.001-1.716 1.717a1.558 1.558 0 11-2.204-2.204l1.717-1.717a3.295 3.295 0 10-4.659-4.66l-.002.002-1.716 1.716a1.558 1.558 0 01-2.204-2.204l1.717-1.717z">
                                                                                                                    </path>
                                                                                                                    <path
                                                                                                                        d="M14.34 7.457a1.558 1.558 0 112.203 2.204l-6.864 6.864a1.558 1.558 0 01-2.203 0l-1.717-1.717a6.411 6.411 0 119.068-9.067l.001.001z">
                                                                                                                    </path>
                                                                                                                </svg>
                                                                                                            </svg>
                                                                                                        </td>
                                                                                                        <td
                                                                                                            style="vertical-align: middle; padding-right: 0px; padding-top: 10px;">
                                                                                                            <a style="text-decoration: none;"
                                                                                                                href="tel:+918092883971"><span
                                                                                                                    style="color: rgb(34, 34, 34);">+91
                                                                                                                    80928
                                                                                                                    83971</span></a>
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
                                                                    <tr>
                                                                        <td>
                                                                            <table cellpadding="0" cellspacing="0" border="0"
                                                                                style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding-top: 16px;">
                                                                                            <span
                                                                                                style="color: rgb(34, 34, 34);">Shivam
                                                                                                Kashyap | Portfolio</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td style="padding-top: 8px;">
                                                                                            <span
                                                                                                style="color: rgb(34, 34, 34);">MERN
                                                                                                Stack Developer</span>
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
                        <div class="footer">
                            <p>This is an automatically generated email. Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            </body>

            </html>
            `
        })

        if (mail) {
            const all = await AdminSchema.find({})
            return res.status(201).json(all)
        } else {
            return res.status(400).json("Registration Failed")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 3: Account verification [Step done via clicking link on user mail]
router.post('/verify', [
    body('email').exists().withMessage("Email not found").isEmail().withMessage("Email is not valid")
], BodyValidator, async (req, res, next) => {

    try {

        const { email } = req.body

        const update = await AdminSchema.findOneAndUpdate({ email }, { $set: { verified: true } })
        if (!update) {
            return res.status(404).json("user not found")
        }

        const user = await AdminSchema.findOne({ email })
        const data = {
            email: user?.email,
            authority: user?.authority
        }

        const token = await jwt.sign(data, process.env.JWTSECRET)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        })

        return res.status(200).json("Account Verified")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 4: Account login [Admin & CourseWritter & BlogWritter]
router.post('/login', [
    body('email').optional().isEmail().withMessage("Not a valid ID"),
    body('password').optional().isLength({ min: 6 }).withMessage("Password is too short")
], BodyValidator, async (req, res, next) => {
    try {

        const { authToken } = req.cookies        
        if (!authToken) {
            
            const { email, password } = req.body
            const user = await AdminSchema.findOne({ email })
            if (!user) {
                return res.status(404).json("User not found")
            }
            
            const isMatched = await bcrypt.compare(password, user.hashPass)
            if (!isMatched) {
                return res.status(400).json("Invalid Password")
            }

            const data = {
                email: user?.email,
                authority: user?.authority
            }

            const token = await jwt.sign(data, process.env.JWTSECRET)
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: true,
                Priority: 'High',
                sameSite: 'None',
            })

            return res.status(200).json(`Login: Success; Mode: ${user?.authority}`)
        } else {            
            const data = await jwt.verify(authToken, process.env.JWTSECRET)
            if (!data) {
                res.clearCookie('authToken', {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                })

                return res.status(400).json("Invalid Token")
            }

            let user = await AdminSchema.findOne({ email: data?.email })
            if (!user) {
                res.clearCookie('authToken', {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                })

                return res.status(404).json("User not found")
            }

            if (user?.verified === false) {
                return res.status(400).json("You need to verify your account")
            } else {
                const token = await jwt.sign(data, process.env.JWTSECRET)
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None'
                })

                return res.status(200).json(`Login: Success; Mode: ${user?.authority}`)
            }
        }
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 5: logout Admin & CourseWriter & BlogWriter
router.post('/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });

    return res.status(200).json("Logout Success");
});


// Route 6: Sending forgot password link to mail id
router.post('/recovery', [
    body('email').exists().withMessage("Email not found").isEmail().withMessage("Email not valid")
], BodyValidator, async (req, res, next) => {
    try {
        // write logic for sending mail and password change link with a token [ http://localhost:3000/change-password?token=<token_goes_here> ]
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 7: Password change
router.put('/change-password', [
    body('email').exists().withMessage("Email not found").isEmail().withMessage("Email not valid"),
    body('password').exists().withMessage("Password not found").isLength({ min: 6 }).withMessage("Password validation failed")
], BodyValidator, async (req, res, next) => {

    try {
        // logic to change password
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }

})


export default router
