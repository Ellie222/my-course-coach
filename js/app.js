// 화면 계층: 데이터는 dataSource.js, 기록은 storage.js에서만 가져옵니다.
import { loadAll } from "./dataSource.js";
import { loadBest, saveBest } from "./storage.js";

const app = document.getElementById("app");
const KEYS = ["A", "B", "C", "D"];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lvClass = lv => (lv === "기초" ? "basic" : "applied");
const optsOf = q => [q.option_a, q.option_b, q.option_c, q.option_d];

let D;            // 불러온 데이터
let answers = {};
const topic = id => D.topics.find(t => t.topic_id === id);
const ruleFor = s => D.rules.find(r => s >= r.min_score && s <= r.max_score);

function home() {
  const best = loadBest(); const total = D.topics.length;
  const done = D.topics.filter(t => best[t.topic_id] != null).length;
  app.innerHTML = `
  <header style="display:flex;flex-direction:column;gap:6px">
    <p class="eyebrow">기초 인체생리학 · 자기 점검</p>
    <h1>오늘 공부할 주제를 고르세요</h1>
    <p class="muted">주제마다 핵심 개념을 읽고 3문항을 풉니다. 기초 주제부터 시작하길 권해요.</p>
  </header>
  <div class="progress"><span>완료 ${done}/${total}</span><div class="bar"><i style="width:${done / total * 100}%"></i></div></div>
  <div class="grid">${D.topics.map(t => { const b = best[t.topic_id]; return `
    <button class="topic" data-id="${t.topic_id}">
      <span class="id">${t.topic_id}</span>
      <h3>${esc(t.title)}</h3>
      <span class="foot"><span class="chip ${lvClass(t.difficulty)}">${esc(t.difficulty)}</span>
      <span class="best ${b != null ? "done" : ""}">${b != null ? "최고 " + b + "점" : "미응시"}</span></span>
    </button>`; }).join("")}</div>
  <p class="note">점수 기록은 이 브라우저에만 저장됩니다.</p>`;
  app.querySelectorAll(".topic").forEach(b => (b.onclick = () => concepts(b.dataset.id)));
  scrollTo(0, 0);
}

function concepts(id) {
  const t = topic(id); const ms = D.materials.filter(m => m.topic_id === id);
  app.innerHTML = `
  <button class="back" id="back">← 주제 목록</button>
  <header style="display:flex;flex-direction:column;gap:8px">
    <p class="eyebrow">${t.topic_id} · 핵심 개념 <span class="chip ${lvClass(t.difficulty)}">${esc(t.difficulty)}</span></p>
    <h1>${esc(t.title)}</h1>
    <p class="obj muted">학습목표: ${esc(t.learning_objective)}</p>
  </header>
  ${ms.map((m, i) => `<section class="card concept">
    <p class="eyebrow">개념 ${i + 1}</p>
    <h3>${esc(m.content)}</h3>
    <div class="ex"><b>예시·적용</b>${esc(m.example)}</div>
  </section>`).join("")}
  <div class="actions"><button class="btn" id="go">문항 풀기</button></div>`;
  document.getElementById("back").onclick = home;
  document.getElementById("go").onclick = () => quiz(id);
  scrollTo(0, 0);
}

function quiz(id) {
  const t = topic(id); const qs = D.questions.filter(q => q.topic_id === id); answers = {};
  const n = qs.length;
  app.innerHTML = `
  <button class="back" id="back">← 개념 다시 보기</button>
  <header style="display:flex;flex-direction:column;gap:6px">
    <p class="eyebrow">${t.topic_id} · 퀴즈</p>
    <h2>${esc(t.title)}</h2>
    <div class="progress"><span id="cnt">0/${n} 응답</span><div class="bar"><i id="pb" style="width:0"></i></div></div>
  </header>
  <form id="qf" style="display:flex;flex-direction:column;gap:20px">
  ${qs.map((q, i) => `<fieldset class="card q"><legend>${i + 1}. ${esc(q.question_text)}</legend><div class="opts">
    ${optsOf(q).map((o, j) => `<label class="opt"><input type="radio" name="${q.question_id}" id="${q.question_id}-${KEYS[j]}" value="${KEYS[j]}"><span><span class="k">${KEYS[j]}</span> ${esc(o)}</span></label>`).join("")}
  </div></fieldset>`).join("")}
  <div class="actions"><button type="submit" class="btn" id="sub" aria-disabled="true">채점하기</button>
  <p class="note" id="hint" style="text-align:center">모든 문항에 답하면 채점할 수 있어요.</p></div>
  </form>`;
  document.getElementById("back").onclick = () => concepts(id);
  const f = document.getElementById("qf");
  f.addEventListener("change", e => {
    answers[e.target.name] = e.target.value; const k = Object.keys(answers).length;
    document.getElementById("cnt").textContent = `${k}/${n} 응답`;
    document.getElementById("pb").style.width = k / n * 100 + "%";
    if (k === n) { document.getElementById("sub").setAttribute("aria-disabled", "false"); document.getElementById("hint").hidden = true; }
  });
  f.addEventListener("submit", e => {
    e.preventDefault();
    const miss = qs.find(q => !answers[q.question_id]);
    if (miss) { document.getElementById(miss.question_id + "-A").closest("fieldset").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    result(id);
  });
  scrollTo(0, 0);
}

function result(id) {
  const t = topic(id); const qs = D.questions.filter(q => q.topic_id === id);
  const correct = qs.filter(q => answers[q.question_id] === q.correct_option).length;
  const score = Math.round(correct / qs.length * 100); const r = ruleFor(score);
  saveBest(id, score);
  const idx = D.topics.findIndex(x => x.topic_id === id); const next = D.topics[idx + 1];
  const label = (q, k) => `${k}. ${optsOf(q)[KEYS.indexOf(k)]}`;
  app.innerHTML = `
  <header style="display:flex;flex-direction:column;gap:6px">
    <p class="eyebrow">${t.topic_id} · 결과</p>
    <h2>${esc(t.title)}</h2>
  </header>
  <section class="card"><div class="score"><span class="n">${score}</span><span class="muted">점 · ${correct}/${qs.length} 정답</span></div></section>
  ${r ? `<section class="card fb"><h3>${esc(r.feedback)}</h3><p class="next"><b>다음 단계</b> · ${esc(r.next_step)}</p></section>` : ""}
  <h3>문항별 해설</h3>
  ${qs.map((q, i) => { const mine = answers[q.question_id]; const ok = mine === q.correct_option; return `
  <section class="card res ${ok ? "ok" : "no"}">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
      <b>${i + 1}. ${esc(q.question_text)}</b><span class="tag ${ok ? "ok" : "no"}">${ok ? "정답" : "오답"}</span></div>
    <dl class="ans"><dt>내 답</dt><dd>${esc(label(q, mine))}</dd>${ok ? "" : `<dt>정답</dt><dd><b>${esc(label(q, q.correct_option))}</b></dd>`}</dl>
    <p class="expl">${esc(q.explanation)}</p>
  </section>`; }).join("")}
  <div class="actions">
    ${score < 100 ? `<button class="btn" id="retry">다시 풀기</button>` : ""}
    ${next ? `<button class="btn ${score < 100 ? "ghost" : ""}" id="next">다음 주제: ${esc(next.title)}</button>` : ""}
    <button class="btn ghost" id="review">개념 다시 보기</button>
    <button class="btn ghost" id="home">주제 목록</button>
  </div>`;
  const on = (i, fn) => { const el = document.getElementById(i); if (el) el.onclick = fn; };
  on("retry", () => quiz(id)); on("next", () => concepts(next.topic_id)); on("review", () => concepts(id)); on("home", home);
  scrollTo(0, 0);
}

loadAll()
  .then(d => { D = d; home(); })
  .catch(err => {
    app.innerHTML = `<h2>데이터를 불러오지 못했어요</h2><p class="muted">${esc(err.message)}</p>
    <p class="note">폴더에서 <code>node server.mjs</code>를 실행한 뒤 http://localhost:8000 으로 접속하세요.</p>`;
  });
