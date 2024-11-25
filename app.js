import express from 'express';
import session from 'express-session';
import cors from 'cors'; 
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
 

const app = express();
 
// Middleware
app.use(cors({
    credentials: true // allow cookies
})); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'fkldjbnfdkFTFT5efd3$$sdg89F',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    secure: false,  
    sameSite: 'lax',  
    maxAge: 3600000 // 1 hour in milliseconds
  }
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