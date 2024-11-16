import express from 'express';
import { hashPassword, comparePassword } from '../lib/utility.js'
import { PrismaClient } from '@prisma/client';


const usersRouter = express.Router();
// Prisma setup
const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
// Signup Route
router.post('/signup', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
  
    // Validate input fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      // Check if the email is already registered
      const existingUser = await prisma.customer.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists.' });
      }
  
    // hash (encrypt) the password
    const hashedPassword = await hashPassword(password);
  
      // Save the new user in the database
      const newUser = await prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          first_name,
          last_name,
        },
      });
  
      // Respond with success
      res.status(201).json({ message: 'User registered successfully!', user: newUser });
    } catch (error) {
      console.error('Error during signup:', error.message);
      res.status(500).json({ message: 'An error occurred during signup.', error: error.message });
    }
  }); 

  router.post('/login', async (req,res) => {
    // get user inputs
    const { email, password } = req.body;
  
    // validate the inputs
    if(!email || !password) {
      return res.status(400).send('Missing required fields');
    }
  
    // find user in database
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      }
    });
    if (!existingUser) {
      return res.status(404).send('User not found');
    }
  
    // compare/verify the password entered
    const passwordMatch = await comparePassword(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid password');
    }
  
    // setup user session data
    req.session.email = existingUser.email;
    req.session.user_id = existingUser.id;
    req.session.name = existingUser.firstName + ' ' + existingUser.lastName;
    console.log('logged in user: ' + req.session.email);
  
    // send response
    res.send('Login successful');
  });
  
  router.post('/logout', (req,res) => {
    req.session.destroy();
    res.send('Successful logout');
  });
  
  router.get('/session', (req,res) => {
    // return logged in user  
    res.json({ 'user' : req.session.email});
  });

export default usersRouter;