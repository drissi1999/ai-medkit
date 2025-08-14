import { db } from './server/database/connection.js';
import { users } from './server/database/schema.js';

async function testDB() {
  try {
    console.log('Testing database...');
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful!');
    console.log('Users table accessible:', result);
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testDB();
