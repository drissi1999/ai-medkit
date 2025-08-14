import { db } from './server/database/connection.js';
import { users } from './server/database/schema.js';

async function checkUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log('=== ALL REGISTERED USERS ===');
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${allUsers.length} user(s):`);
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Specialization: ${user.specialization}`);
        console.log(`   Hospital: ${user.hospitalName}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('   ---');
      });
    }
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
  process.exit(0);
}

checkUsers();
