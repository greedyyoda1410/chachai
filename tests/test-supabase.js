import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nurpafczinakyxvizija.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51cnBhZmN6aW5ha3l4dml6aWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNTg3MTIsImV4cCI6MjA4MjYzNDcxMn0.j1vsPsEDzKn6jddFZk02UgycGRQJ9SssLfDRY4Mb_ho';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Found', data?.length || 0, 'categories');
  }
}

test();
