// 데이터 계층: Supabase의 4개 테이블(topics, materials, questions, feedback_rules)을 읽습니다.
// 화면(app.js)은 loadAll()만 사용하므로 화면 코드는 바뀌지 않습니다.
import { getConfig } from "./config.js";
let CONFIG;

const TABLES = {
  topics: "topic_id,title,learning_objective,difficulty&order=topic_id",
  materials: "material_id,topic_id,sort_order,content,example&order=topic_id,sort_order",
  questions: "question_id,topic_id,question_text,option_a,option_b,option_c,option_d,correct_option,explanation&order=question_id",
  feedback_rules: "rule_id,min_score,max_score,feedback,next_step&order=min_score",
};

async function fetchTable(name) {
  const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${name}?select=${TABLES[name]}`, {
    headers: { apikey: CONFIG.supabaseKey, Authorization: `Bearer ${CONFIG.supabaseKey}` },
  });
  if (!res.ok) throw new Error(`Supabase ${name} 테이블을 불러오지 못했습니다 (${res.status})`);
  const rows = await res.json();
  if (!rows.length) throw new Error(`Supabase ${name} 테이블이 비어 있거나 읽기 권한(RLS)이 없습니다.`);
  return rows;
}

export async function loadAll() {
  CONFIG = await getConfig();
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey)
    throw new Error("SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY가 비어 있습니다. 로컬은 .env.local, Vercel은 Environment Variables에 설정한 뒤 다시 실행·배포하세요.");
  const [topics, materials, questions, rules] = await Promise.all(Object.keys(TABLES).map(fetchTable));
  return {
    topics,
    materials,
    questions: questions.map(q => ({ ...q, correct_option: String(q.correct_option).trim() })),
    rules,
  };
}
