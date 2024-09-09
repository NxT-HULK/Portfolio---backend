import express from 'express'
import { VerifyAdmin } from '../../../middleware/VerifyAdmin.js'
import ContactRoute from '../contact/route.js'
import MailRoute from '../mailing/route.js'
import NewsRoute from '../news/route.js'
import NotificationRoute from '../notify/route.js'
import TestimonialRoute from '../testimonial/route.js'
import WorkRoute from '../work/route.js'
import CourseRoute from '../course/route.js'
import AdminAuthRoutes from '../admin/route.js'


// Admin verification directly here
const router = express.Router()


// Route: master route 
router.use("/", AdminAuthRoutes)

// From here all routes will be secured via VerifyAdmin [Admin & CourseWritter & BlogWritter]
router.use(VerifyAdmin)

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