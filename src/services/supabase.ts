import { createClient } from '@supabase/supabase-js';

// No Expo, usamos process.env para acessar o .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Criamos a instância do cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);