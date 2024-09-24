import { createClient } from '@supabase/supabase-js';

const supabaseURL = 'https://sjzxlmlfgbpwhwobsiga.supabase.co';

export const supabase = createClient(supabaseURL, process.env.NEXT_PUBLIC_SUPABASE_KEY);
