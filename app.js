import express from 'express';
import session from 'express-session';
import cors from 'cors';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import memorystore from 'memorystore';

const app = express();
const MemoryStore = memorystore(session); // Initialize MemoryStore with the session middleware


// CORS Middleware for handling cross-origin requests
app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true, // Allow cookies and credentials
  })
);

// Middleware for parsing request body and serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public')); // Serves static files from the public directory

// Session Middleware for handling user sessions
app.use(
  session({
    secret: 'fkldjbnfdkFTFT5efd3$$sdg89F', // Replace with a secure environment variable in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'None',  // Allow cross-origin requests
      secure: false,     
      httpOnly: true,
      maxAge: 3600000,   // 1 hour
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24 hours
    }),
  })
);

// Routes
app.use('/users', usersRouter); // Handles /users routes
app.use('/products', productsRouter); // Handles /products routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const port = process.env.PORT || 3000; // Use environment variable for flexibility
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
