import express from 'express'
import errorMiddleware from '../middleware/error.js'
import Course from '../models/course.js'
import CoursePageSchema from '../models/course_page.js'
import CourseModuleSchema from '../models/course_module.js'
import { body } from 'express-validator';
import BodyValidator from '../middleware/BodyValidator.js'
import { AuthorityMatch__CourseWritter } from '../middleware/AuthorityVerification.js';
import CoursePageMessageSchema from '../models/course_page_message.js';

const router = express.Router();
router.use(AuthorityMatch__CourseWritter)


// Route 1: Get all course
router.get('/', async (req, res, next) => {
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

        return res.status(200).json(allCourses);

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
})


// Route 2: Create new course || Update old course data (basic Data)
router.post('/', [
    body('name').exists().withMessage('Please define course name').isLength({ min: 25 }).withMessage('Course name is too short'),
    body('img').exists().withMessage('Please input background img url').isURL().withMessage('Not a valid link'),
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


// Route 3: push modules in course || Update old Module
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


// Route 4: push pages in course[module][page] || Update old page
router.put('/modules/add_page', [
    body('module_id').exists().withMessage('Please define module id').isMongoId().withMessage('Not a valid module id!'),
    body('page_name').exists().withMessage('Please provide name of page').isLength({ min: 10 }).withMessage('Page name is too short!'),
    body('page_number').exists().withMessage('Please provide page number').isNumeric().withMessage('Invalid page number'),
    body('html').exists().withMessage('Please provide details of page').isLength({ min: 100 }).withMessage('Page content is too short!')
], BodyValidator, async (req, res, next) => {

    let { module_id, page_name, page_number, html, updateFlag, pageId } = req.body

    try {
        if (!updateFlag) {
            let page = new CoursePageSchema({
                name: page_name,
                of_module: module_id,
                page_number: page_number,
                html: html,
                status: false
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


// Route 5: delete particular page endpoint
router.post('/modules/page', [
    body('module_id').exists().withMessage('Please define module id!').isMongoId().withMessage('Not a valid module id!'),
    body('page_id').exists().withMessage('Please define page id!').isMongoId().withMessage('Not a valid page id')
], BodyValidator, async (req, res, next) => {

    try {

        let { module_id, page_id } = req.body

        let page = await CoursePageSchema.findOne({ _id: page_id })
        await CourseModuleSchema.findOneAndUpdate({ _id: module_id }, { $pull: { pages: page_id } })
        await CoursePageSchema.findOneAndDelete({ _id: page_id })

        return res.status(200).json(`PAGE: "${page.name}" has been deleted`)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }

})


// Route 6: delete particular module of course
router.post('/module', [
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


// Route 7: delete a particular course
router.post('/delete-course', [
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


// Route 8: Updating course status
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

// Route 9: Getting course material
router.post('/learning-material/', [

    body('course').exists().withMessage("Course not exist").isMongoId().withMessage("Not a valid mongo ID")

], async (req, res) => {
    try {

        let _id = req.body.course;

        let course = await Course.findOne({ _id });
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


// Route 10: Toggle page status
router.post('/toggle-page-status', [

    body('id').exists().withMessage("Page ID not found").isMongoId().withMessage("Page ID not valid"),
    body('flag').exists().withMessage("Status flag not found").isBoolean().withMessage("Page flag is not valid")

], BodyValidator, async (req, res, next) => {
    try {

        const { id, flag } = req.body
        const update = await CoursePageSchema.findByIdAndUpdate({ _id: id }, { $set: { status: flag } })

        if (update)
            return res.status(200).json(`Page: ${update?.name} || status: ${flag} `)
        else
            return res.status(404).json("Page not found")

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 11: Get all pages of selected modules
router.post('/modules/pages', [
    body('module_id').exists().withMessage('Please define module id!').isMongoId().withMessage('Not a valid module id!')
], BodyValidator, async (req, res, next) => {
    try {
        let { module_id } = req.body
        let courseModule = await CourseModuleSchema.findOne({ _id: module_id })

        let arr = courseModule?.pages ?? []
        let allPages = await CoursePageSchema.find({ _id: { $in: arr } })

        return res.status(200).json(allPages)

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 12: Delete a particualr message
router.delete('/ask/:messageId', async (req, res, next) => {
    try {

        const messageId = req.params.messageId;
        const message = await CoursePageMessageSchema.findById(messageId);
        if (!message) {
            return res.status(404).json("Message not found");
        }

        const page = await CoursePageSchema.findOneAndUpdate(
            { _id: message.ofPage },
            { $pull: { message: messageId } }
        );

        await CoursePageMessageSchema.findByIdAndDelete(messageId);
        return res.status(200).json({ messageId: message?._id, pageId: page?._id });

    } catch (error) {
        errorMiddleware(error, req, res, next);
    }
});


// Route 13: get all message data
router.get('/ask', async (req, res, next) => {
    try {

        const data = await CoursePageSchema.find({
            message: { $exists: true, $ne: [] }, // Ensure message field exists and is not an empty array
            $expr: { $gt: [{ $size: "$message" }, 0] } // Check that message array size is greater than 0
        }).populate('message')


        if (data?.length === 0) {
            return res.status(404).json("No pages with messages found");
        }

        return res.status(200).json(data);

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})


// Route 14: Send reply of message
router.post('/ask', [

    body('messageId').exists().withMessage("Message ID not found").isMongoId().withMessage("Invalid message ID"),
    body('mailFlag').exists().withMessage("Mail flag not found").isBoolean().withMessage("Invalid mail flag!"),
    body('reply').exists().withMessage("Reply message not found").isLength({ min: 25 }).withMessage("Reply message is too short!"),
    body('email').optional().isEmail().withMessage("Invalid email!"),
    body('subject').optional().isLength({ min: 25 }).withMessage("Subject is too short!"),
    body('mailData').optional().isLength({ min: 25 }).withMessage("Mail is too short!"),

], BodyValidator, async (req, res, next) => {
    try {

        const { mailFlag, reply, email, subject, mailData, messageId } = req.body
        const update = await CoursePageMessageSchema.findOneAndUpdate({ _id: messageId }, { $set: { reply: reply } })

        if (mailFlag === true) {
            await nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAILINGADDRESS,
                    pass: process.env.MAILINGKEY
                }
            }).sendMail({
                from: process.env.MAILINGADDRESS,
                to: email,
                subject: subject,
                html: mailData
            })

            return res.status(200).json({ pageId: update?.ofPage, messageId: messageId })
        } else {
            return res.status(200).json({ pageId: update?.ofPage, messageId: messageId })
        }

    } catch (error) {
        errorMiddleware(error, req, res, next)
    }
})

export default router
