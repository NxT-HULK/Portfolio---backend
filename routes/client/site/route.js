import express from 'express'
import ContactRoute from '../contact/route.js'
import NewsRoute from '../news/route.js'
import NotificationRoute from '../notify/route.js'
import TestimonialRoute from '../testimonial/route.js'
import WorkRoute from '../work/route.js'
import CourseRoute from '../course/route.js'

const router = express.Router()

// Route 1: Contact route
router.use('/contact', ContactRoute)

// Route 2: News route
router.use('/news', NewsRoute)

// Route 3: Notificaton route
router.use('/notification', NotificationRoute)

// Route 4: Testimonial route
router.use('/testimonial', TestimonialRoute)

// Route 5: Work route
router.use('/work', WorkRoute)

// Route 6: Course route
router.use('/course', CourseRoute)

export default router