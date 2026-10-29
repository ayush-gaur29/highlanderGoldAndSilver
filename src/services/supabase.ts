import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://azibnvfxnsrocmobzswt.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_uNLQLczI2qACWRJDxAJTVg_mWyfHUJZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

/**
 * Resolves an image path from Supabase storage or local assets.
 */
export function resolveImageUrl(path: string | undefined | null): string {
  if (!path) {
    return '/assets/brand/highlander_refined_emblem.jpg';
  }

  // If already absolute URL (http/https)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If Supabase Storage relative path (e.g. catalog-images/item-001.jpg or items/...)
  if (path.startsWith('catalog-images/')) {
    const objectPath = path.replace(/^catalog-images\//, '');
    const { data } = supabase.storage.from('catalog-images').getPublicUrl(objectPath);
    return data.publicUrl;
  }

  // If root-relative local path (e.g. /assets/items/...)
  if (path.startsWith('/')) {
    return path;
  }

  // If relative path without leading slash
  return `/${path}`;
}
