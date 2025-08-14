import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection.js';
import { users } from '../database/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, specialization, hospitalName } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      specialization,
      hospitalName
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      specialization: users.specialization
    });
    
    // Generate token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: newUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      specialization: user.specialization
    };
    
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      specialization: users.specialization
    }).from(users).where(eq(users.id, decoded.userId));
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
