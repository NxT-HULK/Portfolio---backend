import express from 'express'
import errorMiddleware from '../middleware/error.js'
import Course from '../models/course.js'
import { body } from 'express-validator';
import BodyValidator from '../middleware/BodyValidator.js'
import CourseModuleSchema from '../models/course_module.js'
import CoursePageSchema from '../models/course_page.js'
import CoursePageMessageSchema from '../models/course_page_message.js'

const router = express.Router();


// Route 1: Get all course
router.get('/', async (req, res, next) => {
    try {

        let allCourses = await Course.find({ status: true, modules: { $exists: true, $ne: [] } });

        allCourses = await Promise.all(allCourses.map(async (ele) => {
            let curr = { ...ele.toObject() };
            curr['first_module'] = curr.modules[0];
            let moduleData = await CourseModuleSchema.findById(curr.modules[0]);
            if (moduleData && moduleData.pages && moduleData.pages.length > 0) {
                curr['first_page'] = moduleData.pages[0];
            } else {
                curr['first_page'] = 0;
            }

            return curr;
        }));

        return res.status(200).json(allCourses);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// Route 2: Get details from entire course --> createdDate and lastUpdatedAt
router.post('/last-updated', [
    body('course_id').exists().withMessage('Course ID not found').isMongoId().withMessage("Course ID not valid!")
], BodyValidator, async (req, res, next) => {
    try {
        let course = await Course.findById({ _id: req.body.course_id });
        if (!course) {
            return res.status(401).json('Unauthorize!')
        }

        let pages = await CoursePageSchema.find({ of_module: { $in: course.modules } }).select('-html')

        let createdAt = pages.toSorted((a, b) => a.updatedAt - b.updatedAt)[0]?.updatedAt
        let lastUpdated = pages.toSorted((a, b) => b.updatedAt - a.updatedAt)[0]?.updatedAt

        return res.status(200).json({
            'start': createdAt,
            'last': lastUpdated
        })
    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 3: Get module array || input: [ModuleID]
router.post('/modules', [
    body('module_arr').exists().withMessage('Please define module array').isArray({ min: 1 }).withMessage('Module array is empty')
], BodyValidator, async (req, res, next) => {

    try {

        let { module_arr } = req.body
        let modules = await CourseModuleSchema.find({ _id: { $in: module_arr } })
        return res.status(200).json(modules)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 4: Get all pages of selected modules
router.post('/modules/pages', [
    body('module_id').exists().withMessage('Please define module id!').isMongoId().withMessage('Not a valid module id!')
], BodyValidator, async (req, res, next) => {
    try {
        let { module_id } = req.body
        let courseModule = await CourseModuleSchema.findOne({ _id: module_id })

        let arr = courseModule?.pages ?? []
        let allPages = await CoursePageSchema.find({ _id: { $in: arr }, status: true })

        return res.status(200).json(allPages)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 5: learning material provider
router.get('/learning-material/:course_id', async (req, res) => {
    try {

        let _id = req.params.course_id;
        let course = null

        course = await Course.findOne({ _id, status: true });
        let modules = course?.modules;

        if (!course) {
            return res.status(400).json({ modules: [], pages: [] });
        }

        if (!course && modules.length === 0) {
            return res.status(400).json({ modules: [], pages: [] });
        }

        let module_details = await CourseModuleSchema.find({ _id: { $in: modules } });
        let all_pages = [];
        module_details.forEach(ele => {
            all_pages = [...all_pages, ...ele.pages];
        });

        // Fetch complete page details
        let page_details = await CoursePageSchema.find({ _id: { $in: all_pages }, status: true });

        return res.status(200).json({ modules: module_details, pages: page_details });

    } catch (error) {
        console.error(error);
        return res.status(500).json('Server Error, ON_GETTING_LEARNING_MATERIAL');
    }
});


// Route 6: Ask doubt or give feedback
router.post('/ask', [
    body('name').exists().withMessage("Name not found").isLength({ min: 3 }).withMessage("Name is too short"),
    body('email').exists().withMessage("Email not found"),
    body('repository').optional().isURL().withMessage("Not a valid repository URL"),
    body('mess').exists().withMessage("Message not found").isLength({ min: 25 }).withMessage("Please elaborate you doubt or feedback elaborately"),
    body('ofPage').exists().withMessage("Page id not found").isMongoId().withMessage("Not a valid mongo ID")
], BodyValidator, async (req, res, next) => {
    try {

        const { name, email, repository, mess, ofPage } = req.body

        let coursepage = await CoursePageSchema.findOne({ _id: ofPage })
        if (!coursepage) {
            return res.status(404).json("Page not found")
        }

        const newMessage = new CoursePageMessageSchema({ name, email, repository, mess, ofPage })
        await newMessage.save()

        await CoursePageSchema.findOneAndUpdate({ _id: ofPage }, { $push: { message: newMessage._id } })

        return res.status(201).json("Your consern has been submited. We will contact you via email if you've asked any doubt. Thank you.")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 7: Get all doubt and of particular page
router.get('/ask/:pageId', async (req, res, next) => {
    try {

        const { pageId } = req.params
        if (!pageId) {
            res.status(400).json("Page ID not found")
        }

        const data = await CoursePageMessageSchema.find({ ofPage: pageId })
        if (!data) {
            return res.status(404).json("No data found")
        }

        return res.status(200).json(data)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


export default router
