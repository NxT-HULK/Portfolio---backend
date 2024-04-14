require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express();
const connectToDB = require('./db')

app.use(cors())
connectToDB();

app.use(express.json());
const port = process.env.PORT || 5000;

// Default End Point
app.use('/', require('./routes/default'));

// Testimonial routes goes here
app.use('/testimonial', require('./routes/testimonial'))

// Contact routes goes here
app.use('/contact', require('./routes/contact'))

// Work routes goes here
app.use('/work', require('./routes/work'))

// Newsletter routes goes here
app.use('/news', require('./routes/news_letter'))

// Custom Mailing - Login Require
app.use('/mail', require('./routes/custom_mailing'))

// Admin login
app.use('/admin', require('./routes/admin'))

// Course Endpoint
app.use('/course', require('./routes/course'))

// Site Notification
app.use('/notify', require('./routes/notification'))

// App listen
app.listen(port, () => {
    console.log(`Server is listening at PORT -  ${port}`);
})
