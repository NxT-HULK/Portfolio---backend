const jwt = require('jsonwebtoken')

const verifyAdmin = (req, res, next) => {
    try {
        let token = req.body.token
        let data = jwt.verify(token, process.env.JWTSECRET)

        let { LoginID, LoginKey } = data
        let passkey = getPassword()

        if (LoginID === process.env.ADMIN_ID && LoginKey === passkey) {
            next();
        } else {
            return res.status(200).json("Invalid Token")
        }
    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
}

module.exports = verifyAdmin