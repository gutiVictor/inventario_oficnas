const db = require('../../src/config/db');

const runMigration = async () => {
  try {
    console.log('Starting migration: Add password column to users table...');
    
    // Add password column if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN 
          ALTER TABLE users ADD COLUMN password VARCHAR(255); 
          RAISE NOTICE 'Password column added';
        ELSE 
          RAISE NOTICE 'Password column already exists';
        END IF; 
      END $$;
    `);

    // Set a default password for existing users (hashed '123456')
    // This is just for migration purposes so existing users can login
    // $2a$10$X7.1.1.1.1.1.1.1.1.1.1 is not a valid hash, let's use a real one or NULL
    // For now, we'll leave it NULL and handle it in the login logic or update manually
    // Or better, let's set a temporary default hash for '123456'
    const defaultHash = '$2a$10$cw.vgtX.1.1.1.1.1.1.1.1.1.1.1'; // Placeholder, better to generate real one in code if needed
    // Actually, let's just add the column. We will create a seed script or manual update later if needed.
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
