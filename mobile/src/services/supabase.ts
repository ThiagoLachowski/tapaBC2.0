import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua pelos valores do seu projeto Supabase
const supabaseUrl = 'https://reknlzkjzrmdvntzizrs.supabase.co';
const supabaseAnonKey = 'sb_publishable_M2YDFIXKXJ3CmTg-A4KFIw_uj66mV_c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});