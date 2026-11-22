// Supabase 연결 정보: 로컬은 .env.local → server.mjs, Vercel은 환경변수 → api/env.js 에서
// /js/env.js 로 전달됩니다. 불러오지 못해도 화면에 오류를 표시할 수 있도록 동적으로 읽습니다.
export async function getConfig() {
  let ENV = {};
  try { ({ ENV } = await import("./env.js")); }
  catch { throw new Error("연결 설정(/js/env.js)을 불러오지 못했습니다. 로컬은 node server.mjs로 실행하고, Vercel은 환경변수 설정 후 다시 배포하세요."); }
  return { supabaseUrl: ENV.SUPABASE_URL, supabaseKey: ENV.SUPABASE_PUBLISHABLE_KEY };
}
