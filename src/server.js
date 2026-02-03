import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import cors from 'cors';
import errorHandler from './middleware/error.middleware.js';

dotenv.config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//IMPORTS
const PORT = process.env.PORT || 3000;

//ENDPOINTS
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/insights', insightsRoutes);

// error handler (last)
app.use(errorHandler);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});