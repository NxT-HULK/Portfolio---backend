import express from 'express'
import NewsSchema from '../models/news_letter.js'
import errorMiddleware from '../middleware/error.js'
import { AuthorityMatch__Admin } from '../middleware/VerifyAdmin.js';

const router = express.Router();


// Middleware checkup
router.use(AuthorityMatch__Admin)


// Get all Subscriber data || Login Require 
router.get('/', async (req, res, next) => {
    try {

        let data = await NewsSchema.find({});
        return res.status(200).json(data);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


export default router
