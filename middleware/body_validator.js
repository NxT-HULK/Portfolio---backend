const { validationResult } = require('express-validator');

const BodyValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array()[0].msg);
    }
    next();
};

module.exports = BodyValidator;
