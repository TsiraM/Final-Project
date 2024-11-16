import express from 'express';
import { hashPassword, comparePassword } from '../lib/utility.js';
import { PrismaClient } from '@prisma/client';
 
const usersRouter = express.Router();  
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
 
// Signup Route
usersRouter.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
 
  // Validate input fields
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'All fields are required.' });
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
 
  // Find user in database
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    }
  });
  if (!existingUser) {
    return res.status(404).json({ message: 'User not found' });
  }
 
  // Compare/verify the password entered
  const passwordMatch = await comparePassword(password, existingUser.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }
 
  // Setup user session data
  req.session.email = existingUser.email;
  req.session.user_id = existingUser.id;
  req.session.name = `${existingUser.first_name} ${existingUser.last_name}`;
  console.log('Logged in user: ' + req.session.email);
 
  // Send response
  res.json({ message: 'Login successful', user: { email: existingUser.email, name: req.session.name } });
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