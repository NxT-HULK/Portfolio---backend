const express = require('express');
const router = express.Router();
const errorMiddleware = require('../middleware/error');
const { body } = require('express-validator');
const Course = require('../models/course');
const CourseModuleSchema = require('../models/course_module')
const CoursePageSchema = require('../models/course_page')
const BodyValidator = require('../middleware/body_validator');
const { default: mongoose } = require('mongoose');


// default get method
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

        return res.status(200).json({ 'courses': allCourses });

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// get course data for admin || admin login require
router.get('/admin/', async (req, res, next) => {
    try {
        let allCourses = await Course.find({})

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

        return res.status(200).json({ 'courses': allCourses });

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// Get details from entire course --> createdDate and lastUpdatedAt
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

// create new course || update old course data (basic Data)
router.post('/', [
    body('name').exists().withMessage('Please define course name').isLength({ min: 25 }).withMessage('Course name is too short'),
    body('img').exists().withMessage('Please input background img url').isURL().withMessage('Not a valid link').custom((value) => {
        let prefixCommon = "https://onedrive.live.com/embed?resid"
        if (prefixCommon !== value.substring(0, 37)) {
            throw new Error('You should provide onedrive embed link')
        }
        return true;
    }),
    body('usedTech').exists().withMessage('Please input \"Tech Stack\" atleast 3 ').isArray({ min: 3 }).withMessage('Please provide atleast 3 \"Tech Stack\"'),
    body('information').exists().withMessage('Please define course description with html raw data').isLength({ min: 50 }).withMessage('Course description is too short!'),
    body('welcome_screen').exists().withMessage('Please define welcome screen html raw data').isLength({ min: 30 }).withMessage('Welcome Screen data html is too short')
], BodyValidator, async (req, res, next) => {

    try {
        let { name, img, usedTech, information, welcome_screen, id } = req.body

        let course = {}
        if (id.length === 24) {
            course = await Course.findByIdAndUpdate(
                { _id: id },
                { $set: { name, img, usedTech, information, welcome_screen } },
                { new: true, upsert: true }
            )

            return res.status(200).json({
                message: `Course: "${name}" is now updated`,
                data: course
            })
        } else {
            course = new Course({
                name: name,
                img: img,
                usedTech: usedTech,
                information: information,
                welcome_screen: welcome_screen
            })

            await course.save()

            return res.status(201).json({
                message: `Course: "${name}" is now created`,
                data: course
            })
        }

    } catch (error) {
        console.log(error);
        errorMiddleware(error, req, res, next)
    }
})


// push modules in course
router.put('/add_module', [
    body('course_id').exists().withMessage('Please provide course id').isMongoId().withMessage('Not a valid mongo object id!'),
    body('module_name').exists().withMessage('Please input module name').isLength({ min: 15 }).withMessage('Module name is too short').isLength({ max: 100 }).withMessage('Module name is too long!'),
    body('module_number').exists().withMessage('Please input module number')
], BodyValidator, async (req, res, next) => {

    try {

        let { course_id, module_name, module_number, update, module_id } = req.body

        if (update === true) {
            let updatedObj = await CourseModuleSchema.findByIdAndUpdate(
                { _id: module_id },
                {
                    $set: {
                        module_name: module_name,
                        module_number: module_number
                    }
                },
                { new: false }
            )

            if (!updatedObj) {
                return res.status(404).json({ message: `Module not found`, data: null })
            } else {
                return res.status(200).json({ message: `Update - ${updatedObj.module_number}. ${updatedObj.module_name}`, data: updatedObj })
            }

        } else {
            let newModule = new CourseModuleSchema({
                course_id: course_id,
                module_name: module_name,
                module_number: module_number,
                of_course: course_id
            })

            await newModule.save()

            let course = await Course.findOneAndUpdate({ _id: course_id }, { $push: { modules: newModule._id } })

            return res.status(201).json({ message: `Module: \"${module_name}\" added to course: \"${course.name}\"`, data: newModule })
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Get module array || input: [ModuleID]
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


// push pages in course[module][page]
router.put('/modules/add_page', [
    body('module_id').exists().withMessage('Please define module id').isMongoId().withMessage('Now a valid course id!'),
    body('page_name').exists().withMessage('Please provide name of page').isLength({ min: 10 }).withMessage('Page name is too short!'),
    body('page_number').exists().withMessage('Please provide page number').isNumeric().withMessage('Invalid page number'),
    body('html').exists().withMessage('Please provide details of page').isLength({ min: 100 }).withMessage('Page content is too short!')
], BodyValidator, async (req, res, next) => {

    try {
        let { module_id, page_name, page_number, html, updateFlag, pageId } = req.body
        if (!updateFlag) {
            let page = new CoursePageSchema({
                name: page_name,
                of_module: module_id,
                page_number: page_number,
                html: html
            })

            await page.save()
            let update = await CourseModuleSchema.findOneAndUpdate({ _id: module_id }, { $push: { pages: page._id } })

            return res.status(201).json({
                message: `Page: "${page_name}" is now inserted at "${update.module_name}"`,
                data: page
            })
        } else {

            let page = await CoursePageSchema.findOneAndUpdate({ _id: pageId }, {
                $set: {
                    name: page_name,
                    page_number: page_number,
                    html: html
                }
            })

            let update = await CoursePageSchema.findById({ _id: page._id })

            return res.status(200).json({
                message: 'Page has been updated',
                data: update
            })
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// get all pages of selected modules
router.post('/modules/pages', [
    body('module_id').exists().withMessage('Please define module id!').isMongoId().withMessage('Not a valid module id!')
], BodyValidator, async (req, res, next) => {
    try {
        let { module_id } = req.body
        let coourseModule = await CourseModuleSchema.findOne({ _id: module_id })

        let arr = coourseModule.pages
        let allPages = await CoursePageSchema.find({ _id: { $in: arr } })

        return res.status(200).json(allPages)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// delete particular page endpoint
router.delete('/modules/page', [
    body('module_id').exists().withMessage('Please define module id!').isMongoId().withMessage('Not a valid module id!'),
    body('page_id').exists().withMessage('Please define page id!').isMongoId().withMessage('Not a valid page id')
], BodyValidator, async (req, res, next) => {

    try {

        let { module_id, page_id } = req.body

        let page = await CoursePageSchema.findOne({ _id: page_id })
        await CourseModuleSchema.findOneAndUpdate({ _id: module_id }, { $pull: { pages: page_id } })
        await CoursePageSchema.findOneAndDelete({ _id: page_id })

        return res.status(200).json({ message: `PAGE: "${page.name}" has been deleted` })

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }

})


// delete particular module of course
router.delete('/module', [
    body('course_id').exists().withMessage('Please provide course id').isMongoId().withMessage('Not a valid course id!'),
    body('module_id').exists().withMessage('Please provide module id').isMongoId().withMessage('Not a valid module id!')
], BodyValidator, async (req, res, next) => {

    try {

        let { course_id, module_id } = req.body

        // getting pages id from curr_module
        let curr_module = await CourseModuleSchema.findOne({ _id: module_id })
        let pages_arr = curr_module.pages

        if (pages_arr.length > 0) {
            // delete curr_module from COURSE
            await Course.findOneAndUpdate({ _id: course_id }, { $pull: { modules: module_id } })

            // remove moving all pages from current module
            await CourseModuleSchema.findOneAndUpdate({ _id: module_id }, { $set: { pages: [] } })

            // deleting curr_module
            await CourseModuleSchema.findOneAndDelete({ _id: module_id })

            // deleting pages of curr_module
            await CoursePageSchema.deleteMany({ _id: { $in: pages_arr } })

        } else {

            // delete curr_module from COURSE
            await Course.findOneAndUpdate({ _id: course_id }, { $pull: { modules: module_id } })

            // deleting curr_module
            await CourseModuleSchema.findOneAndDelete({ _id: module_id })
        }

        return res.status(200).json('Module deleted successfully')

    } catch (error) {
        console.log(error);
        errorMiddleware(error, req, res, next)
    }

})


// delete a particular course
router.delete('/', [
    body('course_id').exists().withMessage('Please define course id').isMongoId().withMessage('Not a valid course id!')
], BodyValidator, async (req, res, next) => {

    try {

        let { course_id } = req.body;
        let course = await Course.findOne({ _id: course_id });

        if (!course) {
            return res.status(404).json('Course not found');
        }

        let module_ref = course.modules;
        let all_modules = await CourseModuleSchema.find({ _id: { $in: module_ref } })

        let all_pages = []
        all_modules.forEach(ele => {
            all_pages = [...all_pages, ...ele.pages]
        });

        await Course.findByIdAndUpdate({ _id: course_id }, { $set: { modules: [] } })
        await Course.findByIdAndDelete({ _id: course_id })
        let module_to_be_deleted = await CourseModuleSchema.deleteMany({ _id: { $in: all_modules } })
        let page_to_be_deleted = await CoursePageSchema.deleteMany({ _id: { $in: all_pages } })

        return res.status(200).json({ module_to_be_deleted, page_to_be_deleted });

    } catch (error) {
        console.log(error);
        errorMiddleware(error, req, res, next);
    }
});


// learning matarial provider
router.get('/learning-matarial/:course_id', async (req, res) => {
    try {

        let _id = req.params.course_id;
        let course = null
        if (req.headers.admin === "true") {
            course = await Course.findOne({ _id });
        } else {
            course = await Course.findOne({ _id, status: true });
        }

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
        let page_details = await CoursePageSchema.find({ _id: { $in: all_pages } });

        return res.status(200).json({ modules: module_details, pages: page_details });

    } catch (error) {
        console.error(error);
        return res.status(500).json('Server Error, ON_GETTING_LEARNING_MATERIAL');
    }
});


// Updating course status
router.put('/update_status', [

    body('course_id').exists().withMessage("Course ID not found").isMongoId().withMessage("Not a valid course ID"),
    body('update').exists().withMessage("Update value not dount").custom((value) => {
        if (value === true || value === false) {
            return true
        }

        throw new Error('Update value should by boolean type')
    })

], BodyValidator, async (req, res, next) => {

    try {

        let { course_id, update } = req.body

        let result = await Course.findByIdAndUpdate({ _id: course_id }, { $set: { status: update } })

        if (!result) {
            return res.status(404).json("Course not found")
        } else {
            return res.status(200).json(`Course: ${result?.name}'s status is now: ${update}`)
        }

    } catch (error) {
        console.log(error);
        errorMiddleware(error, req, res, next)
    }

})

module.exports = router;