import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Retail Management Backend is running!',
    });
});


// Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
