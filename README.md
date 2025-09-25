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

## 구현된 주요 기능
- 쉬움/보통/어려움 난이도 퍼즐을 무작위로 로딩하고 진행 상황을 로컬 스토리지에 자동 저장
- 메모 모드, 힌트, 되돌리기/다시하기, 퍼즐 초기화 등 핵심 스도쿠 UX 제공
- 행·열·박스 중복 검사 기반 실시간 충돌 피드백과 실수 카운터 표시
- 퍼즐 완료 시 축하 이펙트, 모바일/데스크톱 반응형 UI, 접근성 친화적 키보드 조작

## 조작 방법
- **마우스/터치**: 보드 셀을 선택한 뒤 상단 숫자 패드로 입력, `메모 모드` 토글을 사용해 후보 숫자를 기록합니다.
- **키보드**: 방향키로 셀 이동, 숫자 `1~9` 입력, `Backspace/Delete`로 지우기, `N` 키로 메모 모드 토글
- **컨트롤 버튼**: 난이도 변경·새 퍼즐, 되돌리기/다시하기, 힌트, 퍼즐 초기화 버튼은 상단 컨트롤 섹션에 배치되어 있습니다.

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
1. 퍼즐 데이터 공급원을 REST API 또는 퍼즐 생성 알고리즘으로 확장하고 도메인 로직 테스트를 강화합니다.
2. Effects 레이어에 사운드·햅틱 토글 및 색각 보조 테마를 추가해 접근성을 마무리합니다.
3. React Testing Library 기반 UI 상호작용 테스트를 도입하고 커버리지 지표를 모니터링합니다.
4. GitHub Actions로 lint/test/빌드 파이프라인을 구성하고 GitHub Pages 자동 배포를 설정합니다.

## 배포
메인 브랜치로 푸시될 때마다 GitHub Actions가 `npm run build`를 실행하고 결과물을 GitHub Pages에 배포합니다. 워크플로는 `.github/workflows/deploy.yml`에서 확인할 수 있으며, Vite `base` 설정은 레포지토리 경로(`/vibe-codex-sudoku/`)에 맞춰져 있습니다.
