import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import ConnectToDB from './middleware/ConnectToDB.js';
import ClientRoute from './routes/client__root.js';
import AdminRoute from './routes/admin__root.js'
import DefaultRoute from './routes/default.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


const whitelist = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://shivamkashyap.netlify.app',
    'http://shivamkashyap.netlify.app'
];

// CORS Options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(helmet()); // Security headers

// Access-Control headers
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (whitelist.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(ConnectToDB);


// Routes
app.use('/', DefaultRoute);
app.use('/api/client/', ClientRoute);
app.use('/api/admin/', AdminRoute);


app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});