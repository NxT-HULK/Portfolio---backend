import jwt from 'jsonwebtoken'
import errorMiddleware from '../middleware/error.js'
import AdminSchema from '../models/admin_account.js'

// Middleware for verifying supper admin [logedin via using .env file]
export const VerifySuperAdmin = async (req, res, next) => {
    try {

        const { authToken } = req.cookies

        let data = await jwt.verify(authToken, process.env.JWTSECRET)
        if (!data) {
            return res.status(400).json("Unauthorize access")
        }

        if (data?.email.localeCompare(process.env.MASTER_ID) === 0) {
            next();
        } else {
            return res.status(400).json("Unauthorize access not allowed")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
}


// Middleware for verifying Admin & CourseWritter & BlogWritter
export const VerifySubAdmin = async (req, res, next) => {
    try {

        let { authToken } = req.cookies
        let data = await jwt.verify(authToken, process.env.JWTSECRET)
        if (!data) {
            return res.status(400).json("Unauthorize access")
        }

        const acc = await AdminSchema.findOne({ email: data?.email })
        if (!acc) {
            return res.status(404).json("User not found")
        } else {
            next();
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
}


// Middleware for AuthorityMatch__Admin
export const AuthorityMatch__Admin = async (req, res, next) => {
    try {

        let { authToken } = req.cookies
        let data = await jwt.verify(authToken, process.env.JWTSECRET)
        if (!data) {
            return res.status(400).json("Unauthorize access")
        }

        if (data?.authority === "Admin") {
            next();
        } else {
            return res.status(400).json("You are not allowed here")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
}


// Middleware for AuthorityMatch__CourseWritter
export const AuthorityMatch__CourseWritter = async (req, res, next) => {
    try {

        let { authToken } = req.cookies
        let data = await jwt.verify(authToken, process.env.JWTSECRET)
        if (!data) {
            return res.status(400).json("Unauthorize access")
        }

        if (data?.authority === "CourseWritter" || data?.authority === "Admin") {
            next();
        } else {
            return res.status(400).json("You are not allowed here")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
}


// Middleware for AuthorityMatch__BlogWritter
export const AuthorityMatch__BlogWritter = async (req, res, next) => {
    try {

        let { authToken } = req.cookies
        let data = await jwt.verify(authToken, process.env.JWTSECRET)
        if (!data) {
            return res.status(400).json("Unauthorize access")
        }

        if (data?.authority === "BlogWritter" || data?.authority === "Admin") {
            next();
        } else {
            return res.status(400).json("You are not allowed here")
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
}
