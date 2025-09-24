# Vibe Codex Sudoku

웹 기반 스도쿠 게임 MVP를 위한 React + Vite 프로젝트입니다. `PRD.md`에서 정의한 클린 아키텍처 원칙을 반영하여 레이어별 책임을 명확히 분리했습니다.

## 개발 환경
- Node.js LTS
- npm 10+

```bash
npm install
npm run dev
```

## 주요 스크립트
- `npm run dev` : 로컬 개발 서버 (Vite)
- `npm run build` : 프로덕션 번들 생성
- `npm run preview` : 빌드 결과 프리뷰
- `npm run lint` : ESLint + boundaries 규칙으로 의존성 위배 검사
- `npm run test` : Vitest 단위 테스트 (CI용)
- `npm run test:watch` : Vitest 워치 모드

## 디렉터리 구조
```
src/
  application/      # 유스케이스, 서비스, 상태 전이 로직 (Domain 의존)
  domain/           # 퍼즐 엔티티, 값 객체, 규칙 (순수 로직)
  effects/          # 애니메이션·사운드 등 부수효과 훅/모듈
  infrastructure/   # 퍼즐 리포지토리, 저장소 어댑터, i18n 등
  shared/           # 공통 상수, 타입, 유틸 (순수 모듈)
  ui/               # React 컴포넌트, 뷰 계층
  main.jsx          # UI 레이어 부트스트랩
```

`eslint-plugin-boundaries`를 활용해 레이어 간 허용된 의존성만 사용할 수 있도록 강제합니다. 필요한 경우 `eslint.config.js`에서 규칙을 조정하세요.

## 다음 단계 제안
1. 퍼즐 데이터 리포지토리를 `infrastructure` 레이어에 실제 JSON/HTTP 기반으로 확장
2. Application 레이어에 상태 머신/스토어 연동 (예: Zustand 어댑터)
3. Effects 레이어에서 애니메이션, 사운드, 햅틱 구현 후 UI에서 훅을 주입
4. Vitest + React Testing Library 셋업으로 Domain/Application 단위 테스트 작성
