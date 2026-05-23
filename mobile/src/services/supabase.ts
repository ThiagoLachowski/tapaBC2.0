import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
  

// Substitua pelos valores do seu projeto Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://backend:54321'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});