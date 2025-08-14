import jwt from 'jsonwebtoken';
import { db } from '../database/connection.js';
import { users } from '../database/schema.js';
import { eq } from 'drizzle-orm';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      specialization: users.specialization
    }).from(users).where(eq(users.id, decoded.userId));
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
