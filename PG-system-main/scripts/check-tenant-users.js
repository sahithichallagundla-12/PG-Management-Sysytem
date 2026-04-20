require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTenantUsers() {
  console.log('--- Checking Tenant-User Relationship ---\n');
  
  const { data: tenants, error: tenantError } = await supabase
    .from('tenants')
    .select('tenant_id, user_id');
  
  if (tenantError) {
    console.log('Error fetching tenants:', tenantError.message);
    return;
  }

  const { data: users, error: userError } = await supabase
    .from('users')
    .select('user_id');
  
  if (userError) {
    console.log('Error fetching users:', userError.message);
    return;
  }

  console.log(`Total tenants: ${tenants.length}`);
  console.log(`Total users: ${users.length}\n`);

  const userIds = new Set(users.map(u => u.user_id));
  const missingUsers = [];

  for (const tenant of tenants) {
    if (!userIds.has(tenant.user_id)) {
      missingUsers.push(tenant);
      console.log(`❌ Tenant ID ${tenant.tenant_id} has user_id ${tenant.user_id} which does not exist in users table`);
    }
  }

  if (missingUsers.length === 0) {
    console.log('✓ All tenants have corresponding user entries');
  } else {
    console.log(`\n⚠ Found ${missingUsers.length} tenants without corresponding user entries`);
  }
}

checkTenantUsers();
