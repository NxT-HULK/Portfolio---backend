import mongoose from 'mongoose';

const ConnectToDB = async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.URI);
            console.log('Connected to MongoDB')
            next()
        } catch (error) {
            console.error('Error connecting to MongoDB:', error)
            return res.status(500).json({ message: 'Database connection failed' })
        }
    } else {
        next()
    }
};

export default ConnectToDB
