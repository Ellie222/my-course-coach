// 학습 기록 저장(현재: 학생 브라우저의 localStorage)
const KEY = "physio-study-best";
export function loadBest() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
export function saveBest(topicId, score) {
  const b = loadBest();
  if (b[topicId] == null || score > b[topicId]) {
    b[topicId] = score;
    try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {}
  }
}
