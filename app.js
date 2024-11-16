import express from 'express';
import usersRouter from './users.js';
import productsRouter from './products.js';

const app = express();

// Middleware
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/users', usersRouter);
app.use('/products', productsRouter);


export default app;
