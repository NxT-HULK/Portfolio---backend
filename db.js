const mongoose = require('mongoose')

const connectToDB = async () => {
    mongoose.set("strictQuery", true);
    
    try {
        await mongoose.connect(process.env.URI, () => {
            console.log(`Connected to DB`)
            
        });
    } catch (error) {
        console.error(`\n\nError Occured in DB connection\n\n`)
    }
}

module.exports = connectToDB