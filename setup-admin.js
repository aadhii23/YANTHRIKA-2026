import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.resolve('.env.local');

async function main() {
  console.log('\n--- Admin Setup ---\n');
  
  rl.question('Admin Username (default: admin): ', (username) => {
    username = username || 'admin';
    
    rl.question('Admin Password: ', async (password) => {
      if (!password) {
        console.log('Password cannot be empty!');
        rl.close();
        return;
      }

      console.log('Generating hash...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      
      const jwtSecret = crypto.randomBytes(32).toString('hex');
      
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      // Replace or append
      const updateEnvVariable = (key, value) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      };

      updateEnvVariable('ADMIN_USERNAME', username);
      updateEnvVariable('ADMIN_PASSWORD_HASH', hash);
      updateEnvVariable('JWT_SECRET', jwtSecret);

      fs.writeFileSync(envPath, envContent.trim() + '\n');
      console.log('\n✅ Setup complete! Created JWT_SECRET and hashed password saved to .env.local\n');
      rl.close();
    });
  });
}

main();
