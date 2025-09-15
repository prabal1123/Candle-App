import { createClient } from "@supabase/supabase-js";

const client = createClient("https://test.supabase.co", "anon-key");
console.log("Supabase client ready", client);
