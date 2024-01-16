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

app.use('/testimonial', require('./routes/testimonial'))

// App listen
app.listen(port, () => {
    console.log(`Server is listening at PORT -  ${port}`);
})
