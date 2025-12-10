
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    console.log('Checking settings table...');
    const { data, error } = await supabase
        .from('settings')
        .select('*');

    if (error) {
        console.error('Error fetching settings:', error);
    } else {
        console.log('Settings data:', JSON.stringify(data, null, 2));
    }
}

checkSettings();
