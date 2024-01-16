require('dotenv').config();
const express = require('express')
const app = express();
const connectToDB = require('./db')

connectToDB();

app.use(express.json());
const port = process.env.PORT || 5000;

// Default End Point
app.use('/', require('./routes/default'));

app.use('/testimonial', require('./routes/testimonial'))

// App listen
app.listen(port, () => {
    console.log(`Server is listening at PORT -  ${port}`);
})
