// 로컬 실행용 서버 (Node 18+, 추가 설치 없음)
// .env.local을 읽어 /js/env.js 로 브라우저에 전달하고, 나머지 파일은 그대로 제공합니다.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname);
const PORT = process.env.PORT || 8000;

function readEnv() {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) return {};
  return Object.fromEntries(readFileSync(file, "utf8").split(/\r?\n/)
    .filter(l => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
}

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".csv": "text/csv; charset=utf-8" };

http.createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (url === "/js/env.js") {
    const env = readEnv();
    const pub = { SUPABASE_URL: env.SUPABASE_URL || "", SUPABASE_PUBLISHABLE_KEY: env.SUPABASE_PUBLISHABLE_KEY || "" };
    res.writeHead(200, { "Content-Type": types[".js"], "Cache-Control": "no-store" });
    return res.end(`export const ENV = ${JSON.stringify(pub)};`);
  }
  const file = path.join(root, url === "/" ? "index.html" : url);
  if (!file.startsWith(root) || path.basename(file).startsWith(".")) { res.writeHead(403); return res.end(); }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(PORT, () => {
  const env = readEnv();
  console.log(`학습앱 실행 중: http://localhost:${PORT}`);
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) console.warn("주의: .env.local에 SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY를 설정하세요.");
});
