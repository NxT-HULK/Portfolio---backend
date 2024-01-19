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

// App listen
app.listen(port, () => {
    console.log(`Server is listening at PORT -  ${port}`);
})
