// References
// Used my magnets_api code general skeleton.
// Retrieved users route code example from https://github.com/mbtrum/inet2005-authentication/blob/main/server/routes/users.js.
// Retrieved purchase code example from ChatGPT and then modified it myself.
// Used ChatGPT to fix bugs.


import express from 'express';
import session from 'express-session';
import cors from 'cors'; // Added CORS
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
 

const app = express();
 
// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable for secret
    resave: false,
    saveUninitialized: true
}));
 
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
 
// Routes
app.use('/users', usersRouter);
app.use('/products', productsRouter);
 
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
