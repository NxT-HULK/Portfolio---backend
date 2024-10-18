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

// Function to send emails
const sendEmail = async (to, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAILINGADDRESS,
            pass: process.env.MAILINGKEY,
        },
    });

    await transporter.sendMail({
        from: process.env.MAILINGADDRESS,
        to,
        subject,
        html: htmlContent,
    });
};


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
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <title>Welcome to the Team!</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; background-color: #6a59d1; padding: 20px; border-radius: 8px 8px 0 0; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to the Team!</h1>
                        </div>
                        <div style="padding: 20px; color: #333;">
                            <p style="line-height: 1.6; margin-bottom: 15px;">Dear ${name},</p>
                            <p style="line-height: 1.6; margin-bottom: 15px;">
                                We are excited to inform you that you have been selected
                                for the part-time job at <strong>Shivam Kashyap</strong>! 🎉 As part of this role, you will be
                                responsible for creating engaging and informative content for our platform. This is an amazing
                                opportunity to contribute to the learning community while enhancing your own skills. 🚀
                            </p>
                            <p style="line-height: 1.6; margin-bottom: 15px;"><strong>📝 Job Details:</strong></p>
                            <ul style="padding-left: 20px; line-height: 1.6; margin-bottom: 15px;">
                                <li><strong>Position:</strong> ${authority}</li>
                                <li><strong>Location:</strong> Remote 🏡</li>
                                <li><strong>Start Date:</strong> As soon as possible ⏳</li>
                            </ul>
                            <p style="line-height: 1.6; margin-bottom: 15px;">
                                We believe that your knowledge and expertise will be a
                                great asset to our team. Please click the link below to confirm your acceptance of this offer and to
                                begin the onboarding process. 📚✨
                            </p>
                            <p style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}"
                                    style="padding: 12px 24px; background-color: #6a59d1; color: #fff; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Activate Your Account 🚀
                                </a>
                            </p>
                            <p style="line-height: 1.6; margin-bottom: 15px;">
                                If the above button is not working, please copy and paste the following link into your browser:
                            </p>
                            <p style="background-color: #222; padding: 10px; text-align: center; color: #fff; margin: 20px 0;">
                                <a href="${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}"
                                    style="color: #fff; text-decoration: none;" target="_blank" rel="noopener noreferrer">
                                    ${process.env.FRONTENDHOST}/#/account/verify?email=${email}&authority=${authority}
                                </a>
                            </p>
                            <p style="line-height: 1.6; margin-bottom: 15px;">If you have any questions, feel free to reach out to us. We are looking forward to working with you and can’t wait to see the amazing contributions you will bring to the team! 💼✨</p>
                            <div style="color: #aaa; font-size: 14px; margin-top: 20px;">
                                <span style="display: block;">This is an exciting update regarding your job application. We can't wait for you to join us!</span>
                            </div>
                        </div>
                        <div style="text-align: center; padding: 20px; background-color: #6a59d1; color: #ffffff; border-radius: 0 0 8px 8px;">
                            <p style="margin: 5px 0;">
                                If you need further assistance, feel free to contact our <a style="color: #fff;" href="${process.env.FRONTENDHOST}/#/contact" target="_blank" rel="noopener noreferrer">support team</a>
                            </p>
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
            authority: user?.authority,
            hashPass: user?.hashPass
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
                authority: user?.authority,
                hashPass: user?.hashPass
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


// Route 6: Sending recovery token to email
router.post('/request-recover-link', [
    body('email').exists().withMessage('Email not found').isEmail().withMessage('Not a valid email ID'),
], BodyValidator, async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await AdminSchema.findOne({ email });

        if (!user) {
            return res.status(200).json('If an account with this email exists, a recovery email will be sent.');
        }

        const token = jwt.sign({ email }, process.env.JWTSECRET, { expiresIn: '15m' });
        const hashedToken = await bcrypt.hash(token, 10);

        await AdminSchema.findOneAndUpdate({ email }, { $set: { recoveryToken: hashedToken } });

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>Admin Account Recovery</title>
            </head>

            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                <div
                    style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                    <div
                        style="text-align: center; background-color: #3f2e9f; padding: 20px; border-radius: 8px 8px 0 0; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 24px;">🔐 Admin Account Recovery</h1>
                    </div>
                    <div style="padding: 20px; color: #333;">
                        <p>Hello ${user.name},</p>
                        <p>We have received a request to recover your admin account. Please use the recovery link provided below to
                            proceed. The link is valid for the next <strong>15 minutes</strong>.</p>

                            <p style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTENDHOST}/#/auth/reset?token=${token}&email=${email}"
                                    style="padding: 12px 24px; background-color: #6a59d1; color: #fff; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Reset Password
                                </a>
                            </p>
                
                            <p style="line-height: 1.6; margin-bottom: 15px;">If the above button is not working, please copy and
                                paste the following link into your browser:</p>
                
                            <p style="background-color: #222; padding: 10px; text-align: center; color: #fff; margin: 20px 0;">
                                <a href="${process.env.FRONTENDHOST}/#/auth/reset?token=${token}&email=${email}"
                                    style="color: #fff; text-decoration: none;" target="_blank" rel="noopener noreferrer">
                                    ${process.env.FRONTENDHOST}/#/auth/reset?token=${token}&email=${email}
                                </a>
                            </p>

                        <p>If you did not request this, please ignore this email. Your account will remain secure.</p>
                    </div>
                    <div
                        style="text-align: center; padding: 20px; background-color: #3f2e9f; color: #ffffff; border-radius: 0 0 8px 8px;">
                        <p>If you've not requested any password change contact our <a href="${process.env.FRONTENDHOST}/#/contact" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: underline;">support team</a></p>
                    </div>
                </div>
            </body>

            </html>
        `;

        await sendEmail(email, 'Account Recovery', htmlContent);
        return res.status(200).json('Recovery link sent successfully to email');
    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// Route 7: Change Password
router.post('/reset-password', [
    body('email').exists().isEmail().withMessage('Invalid email'),
    body('token').exists().withMessage('Token not found'),
    body('password').exists().isLength({ min: 6 }).withMessage('Password is too short'),
], BodyValidator, async (req, res, next) => {
    try {
        const { email, token, password } = req.body;
        const user = await AdminSchema.findOne({ email });

        if (!user) {
            return res.status(400).json('User not found');
        }

        // Compare the provided token with the hashed token in the database
        const isValidToken = await bcrypt.compare(token, user.recoveryToken);
        if (!isValidToken) {
            return res.status(400).json('Unauthorized access, invalid token.');
        }

        // Verify if the token has expired
        try {
            jwt.verify(token, process.env.JWTSECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json('Token has expired. Please request a new password reset.');
            }
            return res.status(400).json('Invalid token.');
        }

        // Check if the new password is the same as the old one
        const isSamePassword = await bcrypt.compare(password, user.hashPass);
        if (isSamePassword) {
            return res.status(400).json('New password cannot be the same as the old password.');
        }

        // Hash and update the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        await AdminSchema.findOneAndUpdate({ email }, { $set: { recoveryToken: "", hashPass: hashedPassword } });

        res.clearCookie('authToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        })

        return res.status(200).json('Password updated successfully');
    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


export default router
