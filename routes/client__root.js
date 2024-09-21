import express from 'express'
import ContactRoute from './client__contact.js'
import NewsRoute from './client__news.js'
import NotificationRoute from './client__notify.js'
import TestimonialRoute from './client__testimonial.js'
import WorkRoute from './client__work.js'
import CourseRoute from './client__course.js'
import FeedbackRoute from './client__feedback.js'

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

// Route 7: Feedback route
router.use('/feedback', FeedbackRoute)

export default router