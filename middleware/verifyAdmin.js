const jwt = require('jsonwebtoken')
const errorMiddleware = require('./error')
const fs = require('fs')

const getPassword = async () => {
    try {
        const filePath = __dirname.toString().split("middleware")[0].concat("key.json")
        const data = await fs.promises.readFile(filePath, 'utf-8');
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

const verifyAdmin = async (req, res, next) => {
    try {
        let token = req.headers.auth_token
        if (!token) { 
            return res.status(400).json("Token not found")
        }

        let data = jwt.verify(token, process.env.JWTSECRET)
        let { LoginID, LoginKey } = data
        let passkey = await getPassword()

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