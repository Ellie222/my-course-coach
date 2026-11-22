// Vercel 서버 함수: Vercel 환경변수를 읽어 브라우저용 /js/env.js 모듈로 돌려줍니다.
// (로컬에서는 server.mjs가 같은 역할을 합니다)
module.exports = (req, res) => {
  const pub = {
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || "",
  };
  res.setHeader("Content-Type", "text/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(`export const ENV = ${JSON.stringify(pub)};`);
};
