const verifyAdmin = (req, res, next) => {
    return res.status(400).json("Invalid admin access")
}

module.exports = verifyAdmin