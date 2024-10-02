// TODO - Account recovery code is pending
import express from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import errorMiddleware from '../middleware/error.js'
import BodyValidator from '../middleware/BodyValidator.js'
import AdminSchema from '../models/admin_account.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { VerifySuperAdmin } from '../middleware/AuthorityVerification.js'

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
                    <title>Welcome to the Team! 🎉</title>
                </head>

                <body
                    style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
                    <div
                        style="max-width: 600px; margin: 2rem auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

                        <h1 style="color: #6a59d1;">Dear ${name},</h1>

                        <p style="color: #000;">
                            We are excited to inform you that you have been selected for the part-time course writing job at
                            <strong>Shivam Kashyap</strong>! 🎉
                        </p>

                        <p style="color: #000;">
                            As part of this role, you will be responsible for creating engaging and informative course content for our
                            platform. This is an amazing opportunity to contribute to the learning community while enhancing your own
                            skills. 🚀
                        </p>

                        <p style="color: #000; font-size: 18px;"><strong>📝 Job Details:</strong></p>
                        <ul style="color: #000;">
                            <li><strong>Position:</strong> ${authority}</li>
                            <li><strong>Location:</strong> Remote 🏡</li>
                            <li><strong>Start Date:</strong> As soon as possible ⏳</li>
                        </ul>

                        <p style="color: #000;">
                            We believe that your knowledge and expertise will be a great asset to our team. Please click the link below
                            to confirm your acceptance of this offer and to begin the onboarding process. 📚✨
                        </p>

                        <p style="text-align: center;">
                            <a href="${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}"
                                style="padding: 12px 24px; background-color: #6a59d1; color: #fff; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Activate Your Account 🚀
                            </a>
                        </p>

                        <p style="color: #000;">
                            If the above button is not working, please copy and paste the following link into your browser:
                        </p>

                        <p style="background-color: #222; padding: 10px; text-align: center;">
                            <a href="${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}"
                                style="color: #fff; text-decoration: none;" target="_blank" rel="noopener noreferrer">
                                ${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}
                            </a>
                        </p>

                        <p style="color: #000;">
                            If you have any questions, feel free to reach out to us. We are looking forward to working with you and
                            can’t wait to see the amazing contributions you will bring to the team! 💼✨
                        </p>

                        <div class="footer" style="margin-top: 1.5rem;">
                            <table cellpadding="0" cellspacing="0"
                                style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse; font-family: 'Comic Sans MS', cursive;">
                                <tbody>
                                    <tr style="width: 100%;">
                                        <td>
                                            <table cellpadding="0" cellspacing="0"
                                                style="border: none; font-size: 100%; line-height: 1; border-collapse: separate; background-color: rgb(237, 235, 249); padding: 16px; font-family: 'Comic Sans MS', cursive; border-radius: 4px;">
                                                <tbody>
                                                    <tr style="width: 100%;">
                                                        <td style="padding-left: 0px; vertical-align: top; padding-top: 0px;">
                                                            <table cellpadding="0" cellspacing="0"
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
                                                                            <table cellpadding="0" cellspacing="0"
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
                                                                            <table cellpadding="0" cellspacing="0"
                                                                                style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding-top: 10px;">
                                                                                            <table cellpadding="0" cellspacing="0"
                                                                                                style="border: none; font-size: 100%; line-height: 1; border-collapse: collapse;">
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td
                                                                                                            style="padding-right: 8px; padding-top: 10px;">
                                                                                                            <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/pgco4oo1ajc7dympzot3.svg"
                                                                                                                alt="">
                                                                                                        </td>
                                                                                                        <td
                                                                                                            style="vertical-align: middle; padding-right: 0px; padding-top: 10px;">
                                                                                                            <span
                                                                                                                style="color: rgb(34, 34, 34);">
                                                                                                                <a style="text-decoration: none; color: inherit;"
                                                                                                                    href="mailto:shivamkumarkashyap12@gmail.com">shivamkumarkashyap12@gmail.com</a>
                                                                                                            </span>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td
                                                                                                            style="padding-right: 8px; padding-top: 10px;">
                                                                                                            <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/dccypkckeopxkyv39s4a.svg"
                                                                                                                alt="" />
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
                                                                            <table cellpadding="0" cellspacing="0"
                                                                                style="border: none; font-size: 100%; line-height: 1; width: auto; border-collapse: collapse;">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding-right: 8px;">
                                                                                            <a href="https://github.com/mernwala"
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                style="display: inline-block; cursor: pointer;">
                                                                                                <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/bnpfhg46g9ixodborvbs.svg"
                                                                                                    alt="">
                                                                                            </a>
                                                                                        </td>
                                                                                        <td style="padding-right: 8px;">
                                                                                            <a href="https://www.linkedin.com/in/shivam-kumar-kashyap-382794249"
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                style="display: inline-block; cursor: pointer;">
                                                                                                <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/sswgmcjvl6kswxkdkwfr.svg"
                                                                                                    alt="">
                                                                                            </a>
                                                                                        </td>
                                                                                        <td style="padding-right: 8px;">
                                                                                            <a href="https://www.instagram.com/nxt_hulk/"
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                style="display: inline-block; cursor: pointer;">
                                                                                                <img src="https://res.cloudinary.com/dusoydzkq/image/upload/v1727889001/e9ffl18onae1rhfgvsxk.svg"
                                                                                                    alt="" />
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
                        </div>

                        <div style="margin-top: 1rem;">
                            <span style="display: block; color: #aaa; font-size: 14px;">This is an exciting update regarding your job
                                application. We can't wait for you to join us!</span>
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
