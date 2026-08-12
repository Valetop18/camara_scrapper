import "dotenv/config"
import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "../src/config/env.js";


export const createSupabaseClient = () => {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_ANON_KEY"),
  );
}