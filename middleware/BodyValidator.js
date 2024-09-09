import { validationResult } from "express-validator";

const ErrorValidator = (req, res, next) => {    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array()[0].msg)
    }
    
    next();
}

export default ErrorValidator