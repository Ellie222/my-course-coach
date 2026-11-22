-- 실습E용: CSV와 같은 열 이름의 테이블. 만든 뒤 Table Editor에서 data/*.csv를 가져오세요.
create table topics (topic_id text primary key, title text not null, learning_objective text, difficulty text);
create table materials (material_id text primary key, topic_id text references topics, sort_order int, content text, example text);
create table questions (question_id text primary key, topic_id text references topics, question_text text,
  option_a text, option_b text, option_c text, option_d text, correct_option char(1), explanation text);
create table feedback_rules (rule_id text primary key, min_score int, max_score int, feedback text, next_step text);
-- 읽기 전용 공개 접근
alter table topics enable row level security; create policy "read" on topics for select using (true);
alter table materials enable row level security; create policy "read" on materials for select using (true);
alter table questions enable row level security; create policy "read" on questions for select using (true);
alter table feedback_rules enable row level security; create policy "read" on feedback_rules for select using (true);
-- 새 프로젝트에서는 테이블 권한이 자동으로 주어지지 않을 수 있으므로 읽기 권한만 부여
grant usage on schema public to anon, authenticated;
grant select on topics, materials, questions, feedback_rules to anon, authenticated;
