#!/usr/bin/env node

/**
 * Generate a password hash for your admin panel.
 * 
 * Usage:
 *   node scripts/generate-password.js yourpassword
 * 
 * Then copy the output and set it as ADMIN_PASSWORD_HASH on Vercel.
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.log('\n🔐 Admin Password Hash Generator\n');
    console.log('Usage:  node scripts/generate-password.js <your-password>\n');
    console.log('Example: node scripts/generate-password.js MySecurePass123\n');
    console.log('Then copy the hash and set it as ADMIN_PASSWORD_HASH on Vercel.\n');
    process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
    console.log('\n🔐 Password Hash Generated!\n');
    console.log('Your hash:\n');
    console.log(hash);
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Vercel project → Settings → Environment Variables');
    console.log('2. Add variable: ADMIN_PASSWORD_HASH');
    console.log('3. Paste the hash above as the value');
    console.log('4. Also add: ADMIN_JWT_SECRET = (any random string, like: ' +
        require('crypto').randomBytes(32).toString('hex').slice(0, 32) + ')');
    console.log('5. Redeploy your site\n');
});
