# 생리학 한 걸음 (기초 인체생리학 학습앱 · Supabase 연결)

## 실행 (Node 18 이상, 추가 설치·AI API 불필요)
1. `.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.
   - SUPABASE_URL: Supabase > Project Settings > API의 Project URL
   - SUPABASE_PUBLISHABLE_KEY: 같은 화면의 Publishable key (sb_publishable_…)
2. `node server.mjs`
3. http://localhost:8000 접속

## 구조
- `js/app.js` 화면 / `js/dataSource.js` Supabase 조회 / `js/config.js` 연결 설정 / `js/storage.js` 기록
- `server.mjs` 로컬 서버: `.env.local`을 읽어 `/js/env.js`로 전달 (`.env.local` 자체는 외부에 제공하지 않음)
- `data/*.csv` 원본 데이터 (보관용, 앱은 읽지 않음)
- `supabase/schema.sql` 테이블 정의

## 주의
- `.env.local`은 `.gitignore`에 포함되어 Git에 올라가지 않습니다.
- service_role(secret) 키는 절대 넣지 마세요. 브라우저에는 publishable 키만 사용합니다.
