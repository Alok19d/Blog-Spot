import dotenv from 'dotenv';
dotenv.config();

import http from 'node:http';
import { app } from './src/app.js';
import connectDB from './src/config/db.js';
import { initializeSocket } from './socket.js';

connectDB()
.then(() => {
    const PORT = process.env.PORT || 8000;
    const server = http.createServer(app);

    initializeSocket(server);

    server.on('error', (error) => {
        console.log(`ERROR: ${error}`);
        throw error;
    });

    server.listen(PORT,() => {
        console.log(`Server is running at PORT: ${PORT}`);
    });
})
.catch((error) => {
    console.log(`MongoDB Connection FAILED !!! ${error}`);
});