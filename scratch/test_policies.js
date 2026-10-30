import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://azibnvfxnsrocmobzswt.supabase.co', 'sb_publishable_uNLQLczI2qACWRJDxAJTVg_mWyfHUJZ');

async function test() {
  const { data, error } = await supabase
    .from('pg_policies')
    .select('*');
  console.log('policies:', { data, error });
}
test();

