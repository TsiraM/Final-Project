import express from 'express';
import { hashPassword, comparePassword } from '../lib/utility.js';
import { PrismaClient } from '@prisma/client';
import passwordValidator from 'password-validator';
 
const usersRouter = express.Router();  
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});


// Create a schema
var schema = new passwordValidator();

// Add properties to it (password validation rules)
schema
.is().min(8)                              // Minimum length 8
.has().uppercase()                        // Must have at least 1 uppercase letter
.has().lowercase()                        // Must have at least 1 lowercase letter
.has().digits(1)                          // Must have at least 1 digit
.has().not().spaces();                    // Should not have spaces

// Signup Route
usersRouter.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  // Validate input fields
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

   // Validate password
   const validationErrors = schema.validate(password, { list: true }); // Get detailed validation errors
   if (validationErrors.length > 0) {
     return res.status(400).json({
       message: 'Password does not meet the required criteria.',
       errors: validationErrors // Send back the list of failed validations
     });
   }

  try {
    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    // Hash (encrypt) the password
    const hashedPassword = await hashPassword(password);

    // Save the new user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      },
    });

    // Respond with success, excluding the password
    res.status(201).json({ message: 'User registered successfully!', user: { id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name } });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'An error occurred during signup.', error: error.message });
  }
});
 
// Login Route
usersRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate the inputs
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Find user in the database
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare/verify the password entered
    const passwordMatch = await comparePassword(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Clear any existing session
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to create session' });
      }

      // Set new session data
      req.session.user_id = existingUser.id;
      req.session.email = existingUser.email;
      req.session.name = `${existingUser.first_name} ${existingUser.last_name}`;

      // Send response
      res.json({
        message: 'Login successful',
        user: {
          email: existingUser.email,
          name: req.session.name,
        },
      });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});
 
  // Session Route (Updated)
  usersRouter.get('/session', async (req, res) => {
    // Check if session exists and user is logged in
    if (!req.session || !req.session.user_id) {
      return res.status(401).json({ message: 'Not logged in' });
    }
  
    try {
      // Fetch user data from the database
      const user = await prisma.user.findUnique({
        where: { id: req.session.user_id },
        select: { id: true, email: true, first_name: true, last_name: true },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with user session data
      res.json({
        customer_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } catch (error) {
      console.error('Error fetching session data:', error);
      res.status(500).json({ message: 'An error occurred while retrieving session data' });
    }
  });
 
// Logout Route
usersRouter.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Successful logout' });
  });
});

 
// Session Route
usersRouter.get('/session', (req, res) => {
  // Return logged in user
  res.json({ user: req.session.email });
});
 
export default usersRouter;