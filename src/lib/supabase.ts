import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * BRANDING HELPERS
 */

// 1. Upload Logo to Storage
export const uploadBrandLogo = async (file: File, clanId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${clanId}-logo-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload file to the 'branding' bucket
  const { error: uploadError } = await supabase.storage
    .from('branding')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get the public URL to save in the 'clans' table
  const { data } = supabase.storage
    .from('branding')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// 2. Update Clan Branding in Database
export const updateClanBranding = async (clanId: string, updates: { 
  name?: string, 
  tagline?: string, 
  logo_url?: string, 
  primary_color?: string 
}) => {
  const { data, error } = await supabase
    .from('clans')
    .update(updates)
    .eq('id', clanId)
    .select();

  if (error) throw error;
  return data;
};