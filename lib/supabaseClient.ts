import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ydlyxfysyrktonktjpbu.supabase.co';
const supabaseKey = 'sb_publishable_n4b3HMl--3jBuY40_fqY6g_H0y7Rgd0';

export const supabase = createClient(supabaseUrl, supabaseKey);