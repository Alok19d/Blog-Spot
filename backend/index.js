import dotenv from 'dotenv';
dotenv.config();

import { app } from './src/app.js';
import connectDB from './src/config/db.js';

connectDB()
.then(() => {
    app.on('error', (error) => {
        console.log(`ERROR: ${error}`);
        throw error;
    });

    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running at PORT: ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log(`MongoDB Connection FAILED !!! ${error}`);
});