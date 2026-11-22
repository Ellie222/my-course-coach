// Supabase 연결 정보는 .env.local → server.mjs → /js/env.js 경로로 전달됩니다.
import { ENV } from "./env.js";
export const CONFIG = {
  supabaseUrl: ENV.SUPABASE_URL,
  supabaseKey: ENV.SUPABASE_PUBLISHABLE_KEY,
};
