import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.DB_URL;
const SUPABASE_KEY = process.env.DB_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
