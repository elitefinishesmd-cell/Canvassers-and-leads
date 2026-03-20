/**
 * Database setup script for Supabase.
 *
 * This script prints the SQL you need to paste into the Supabase SQL Editor:
 * 1. Go to https://supabase.com/dashboard/project/dgcazzzdtvhtmfpizzto/sql
 * 2. Paste the SQL output below
 * 3. Click "Run"
 *
 * After running the SQL, run: node seed.js
 */

const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, 'migrations', '001_initial.sql'), 'utf8');

console.log('='.repeat(60));
console.log('SUPABASE DATABASE SETUP');
console.log('='.repeat(60));
console.log('');
console.log('1. Open your Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/dgcazzzdtvhtmfpizzto/sql/new');
console.log('');
console.log('2. Paste the following SQL and click "Run":');
console.log('');
console.log('-'.repeat(60));
console.log(sql);
console.log('-'.repeat(60));
console.log('');
console.log('3. After running the SQL, come back and run: node seed.js');
console.log('');
