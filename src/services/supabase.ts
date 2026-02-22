import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. Importe o AsyncStorage

const extra = Constants.expoConfig?.extra;

const supabaseUrl = extra?.supabaseUrl;
const supabaseAnonKey = extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars not loaded');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage, // 2. Configure para usar o AsyncStorage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);