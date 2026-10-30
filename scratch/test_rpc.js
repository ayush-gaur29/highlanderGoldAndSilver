import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://azibnvfxnsrocmobzswt.supabase.co', 'sb_publishable_uNLQLczI2qACWRJDxAJTVg_mWyfHUJZ');

async function test() {
  // Let's check RPC or schema if any
  const { data, error } = await supabase.rpc('get_schema_version');
  console.log('rpc test:', { data, error });
}
test();

