import express from 'express'
import { VerifySubAdmin } from '../middleware/AuthorityVerification.js'
import ContactRoute from './admin__contact.js'
import MailRoute from './admin__mailing.js'
import NewsRoute from './admin__news.js'
import NotificationRoute from './admin__notify.js'
import TestimonialRoute from './admin__testimonial.js'
import WorkRoute from './admin__work.js'
import CourseRoute from './admin__course.js'
import AdminAuthRoutes from './admin__admin.js'


// Admin verification directly here
const router = express.Router()


// Route: master route 
router.use("/", AdminAuthRoutes)

// From here all routes will be secured via VerifyAdmin [Admin & CourseWritter & BlogWritter]
router.use(VerifySubAdmin)

// Route 1: Contact route
router.use('/contact', ContactRoute)

// Route 2: Mailing route
router.use('/mail', MailRoute)

// Route 3: News route
router.use('/news', NewsRoute)

// Route 4: Notificaton route
router.use('/notification', NotificationRoute)

// Route 5: Testimonial route
router.use('/testimonial', TestimonialRoute)

// Route 6: Work route
router.use('/work', WorkRoute)

// Route 7: Course route
router.use("/course", CourseRoute)

export default router