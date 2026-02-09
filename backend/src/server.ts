import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middlewares
app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hotel Management System API is running (TypeScript)...');
});

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB successfully!');
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('❌ MongoDB connection error:', err);
        });
} else {
    console.error('❌ MONGODB_URI is not defined in .env file!');
}