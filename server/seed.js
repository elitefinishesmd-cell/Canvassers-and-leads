const { supabase } = require('./supabase');
const bcrypt = require('bcryptjs');

const DEFAULT_USERS = [
  { name: 'Victor', pin: '1234', role: 'supervisor' },
  { name: 'Jeff', pin: '5678', role: 'estimator' }
];

async function seed() {
  console.log('Checking connection to Supabase...');

  // Test connection
  const { data: services, error: svcErr } = await supabase.from('services').select('id').limit(1);
  if (svcErr) {
    console.error('Cannot connect to Supabase or tables not set up yet.');
    console.error('Error:', svcErr.message);
    console.error('');
    console.error('Run "node setup-db.js" for instructions on setting up the database.');
    process.exit(1);
  }

  console.log('Connected to Supabase.');

  // Seed default users
  for (const user of DEFAULT_USERS) {
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('name', user.name)
      .maybeSingle();

    if (!existing) {
      const hash = bcrypt.hashSync(user.pin, 10);
      const { error } = await supabase
        .from('app_users')
        .insert({ name: user.name, pin_hash: hash, role: user.role });

      if (error) {
        console.error(`Failed to create ${user.name}:`, error.message);
      } else {
        console.log(`Created user: ${user.name} (${user.role}) — PIN: ${user.pin}`);
      }
    } else {
      console.log(`User ${user.name} already exists, skipping`);
    }
  }

  console.log('Seed complete');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
