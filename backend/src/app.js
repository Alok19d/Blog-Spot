import express, { urlencoded } from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(urlencoded({extended: true}));


/* Routes Import */
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import commentRouter from './routes/comment.routes.js';
import categoryRouter from './routes/category.routes.js';
import viewRouter from './routes/view.routes.js';
import bookmarkRouter from './routes/bookmark.routes.js';
import newsletterRouter from './routes/newsletter.routes.js';
import roomRouter from './routes/room.routes.js';

/* Routes Deceleration */
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/view', viewRouter);
app.use('/api/v1/bookmark', bookmarkRouter);
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/room', roomRouter);

/* Handles Error */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || `Internal Server Error`;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

export { app }