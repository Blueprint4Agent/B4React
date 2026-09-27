# 프론트엔드 테스트 엔지니어링 가이드

이 문서는 B4React 저장소의 테스트 아키텍처와 실행 규칙을 정의합니다.

## 0) 범위와 우선순위

- 범위: `src/tests` 및 `tests` 하위 전체
- 프론트엔드 테스트 작업 전 읽기 순서:

1. 루트 `AGENTS.md`
2. `FRONTEND.md`
3. 이 문서 (`TEST.md`)

## 1) 테스트 피라미드 (De Facto)

1. Unit: 순수 유틸 및 작은 로직 분기
2. Component: 페이지/컴포넌트 사용자 상호작용 및 렌더링 동작
3. Integration: MSW 기반 API 레이어 + 훅 동작
4. E2E: Playwright 기반 브라우저 라우트 스모크 및 핵심 사용자 여정

## 1.1) 백엔드 시나리오 정합 규칙

프론트 시나리오 테스트는 아래 백엔드 `full-system` 시퀀스를 추적해야 합니다.

1. [B4FastAPI 테스트 가이드](https://github.com/Blueprint4Agent/B4FastAPI/blob/main/src/backend/TEST.md) (`## 8.1) Seeded Full-System Scenario Sequence`)

정합 정책:

1. 주체/자격증명/API 키 이름은 공통 시나리오 fixture(`src/tests/fixtures/fullSystemScenarioData.ts`)에 유지
2. 프론트 UX에서 도달 가능한 백엔드 계약 분기를 커버
3. 프론트 UI에 노출되지 않는 백엔드 전용 플로우(예: `/auth/me`의 `X-API-Key` 인증)는 out-of-scope로 문서화하고 백엔드 테스트에서 검증 유지

## 2) 현재 테스트 레이아웃

```text

  src/
    tests/
      unit/
        hooks/
          serverConnectivity.test.ts
        utils/
          apiBase.test.ts
          desktopRuntime.test.ts
          validation.test.ts
      component/
        App.test.tsx
        components/
          layout/
            AppSidebar.test.tsx
            DesktopTitleBar.test.tsx
        pages/
          login/
            LoginPage.test.tsx
          settings/
            SettingsPage.test.tsx
      integration/
        api/
          configApi.test.ts
          systemApi.test.ts
        hooks/
          useAuth.test.tsx
          useFeatures.test.tsx
          useServerConnectivity.test.tsx
      fixtures/
        fullSystemScenarioData.ts
      setup.ts
      mocks/
        handlers.ts
        server.ts
      utils/
        renderWithRouter.tsx
  tests/
    e2e/
      auth-smoke.spec.ts
  playwright.config.ts
```

## 3) 툴링

1. Unit/Component/Integration: `Vitest + Testing Library + MSW`
2. E2E: `Playwright`

## 4) 마커 없는 실행 명령

Vitest 스위트 전체 실행:

```bash
cd B4React
npm run test
```

Unit 테스트만 실행:

```bash
cd B4React
npm run test:unit
```

Component 테스트만 실행:

```bash
cd B4React
npm run test:component
```

Integration 테스트만 실행:

```bash
cd B4React
npm run test:integration
```

전체 테스트 매트릭스 순차 실행 (unit -> component -> integration -> e2e):

```bash
cd B4React
npm run test:all
```

Vitest watch 모드 실행:

```bash
cd B4React
npm run test:watch
```

E2E 라우트 스모크 실행:

```bash
cd B4React
npm run test:e2e
```

E2E UI 모드 실행:

```bash
cd B4React
npm run test:e2e:ui
```

## 5) MSW 규칙

1. 기본 API mock은 `src/tests/mocks/handlers.ts`에 중앙화
2. 분기별 payload가 필요한 테스트는 `server.use(...)`로 handler override
3. 미처리 요청은 실패로 간주 (`onUnhandledRequest: "error"`)

## 6) 테스트 작성 형식

각 테스트는 Given/When/Then 주석으로 시나리오 의도를 명확히 유지합니다.

템플릿:

```ts
it("<behavior>", async () => {
    // Given: ...
    // When: ...
    // Then: ...
});
```

## 7) 도메인 온보딩 규칙

새 프론트엔드 도메인을 추가할 때:

1. 공통 도메인 유틸이 있으면 unit 테스트 추가
2. 핵심 상호작용/검증 플로우에 대한 component/page 테스트 추가
3. API 모듈의 에러/성공 분기에 대한 integration 테스트를 MSW로 추가
4. 핵심 라우트라면 Playwright 라우트 스모크 최소 1개 추가

## 8) 현재 시나리오 인벤토리

1. `src/tests/unit/utils/apiBase.test.ts`
    - 인증 쿠키의 same-site 유지를 위한 로컬 루프백 호스트 정렬
2. `src/tests/unit/utils/desktopRuntime.test.ts`
    - 브라우저/Tauri 런타임 구분과 데스크톱 플랫폼 감지
3. `src/tests/unit/utils/validation.test.ts`
    - 이메일/비밀번호 검증의 성공/실패 분기
4. `src/tests/component/components/layout/DesktopTitleBar.test.tsx`
    - 브라우저 숨김, macOS 네이티브 컨트롤, Windows 창 액션, standalone 연결 상태 배치
5. `src/tests/integration/api/configApi.test.ts`
    - `/config` 성공/실패 API 응답 처리
6. `src/tests/component/pages/login/LoginPage.test.tsx`
    - 잘못된 이메일의 클라이언트 검증 분기
    - 로그인 성공 submit + 내비게이션 분기
    - `INVALID_CREDENTIALS` 남은 시도 횟수 분기
    - `EMAIL_NOT_VERIFIED` + 인증 메일 재전송 분기
7. `src/tests/component/pages/settings/SettingsPage.test.tsx`
    - 역할 배지 표시 분기:
      admin은 배지 표시, user는 배지 숨김
    - 백엔드 정합 API 키 라이프사이클:
      create -> reveal -> list-visible -> disable -> enable -> delete
    - 백엔드 정합 에러 분기:
      duplicate-name (`API_KEY_NAME_ALREADY_EXISTS`), delete not-found (`API_KEY_NOT_FOUND`)
8. `src/tests/integration/hooks/useAuth.test.tsx`
    - refresh bootstrap 성공 분기 (토큰 없음 -> refresh -> me)
    - 저장된 토큰 + `/me` 성공 분기 (refresh skip)
    - `/me` 실패 + refresh 실패 분기 (토큰 삭제 및 로그아웃 상태)
    - logout API 실패 시에도 `finally`에서 클라이언트 세션 정리 분기
9. `tests/e2e/auth-smoke.spec.ts`
    - 브라우저 레벨 `/login` 라우트 렌더 스모크
10. `src/tests/unit/hooks/serverConnectivity.test.ts`
    - 지수 재연결 지연, 최대 지연 및 jitter 경계
11. `src/tests/integration/api/systemApi.test.ts`
    - `/health/ready`의 ready/degraded 응답 처리
12. `src/tests/integration/hooks/useServerConnectivity.test.tsx`
    - 브라우저 polling 제외 및 Tauri offline-to-online 복구
13. `src/tests/component/App.test.tsx`
    - `/config`를 사용할 수 없을 때 보호 라우팅의 fail-closed 처리, 공용 public Nav 구조, 지연된 재시도 로딩 상태
14. `src/tests/integration/hooks/useFeatures.test.tsx`
    - 설정 실패와 명시적 로그인 비활성화 구분 및 재시도 복구
15. `src/tests/component/components/layout/AppSidebar.test.tsx`
    - 프로필 컨트롤 옆 compact 데스크톱 연결 상태 배치, 안정적인 재시도 문구, 오프라인 로그아웃 차단
16. `src/tests/component/pages/main/LandingPage.test.tsx`
    - 공용 public Nav 구조와 랜딩 탐색 동작

## 8.1) 백엔드 Full-System 매핑 (프론트 도달 가능 부분집합)

매핑된 Auth 분기:

1. 로그인 성공
2. 남은 시도 횟수를 포함한 잘못된 자격증명 로그인
3. 이메일 미인증 + 인증 메일 재전송 액션
4. 잘못된 이메일 형식의 클라이언트 검증
5. access token 누락 시 refresh 기반 세션 bootstrap
6. `/me`와 refresh 모두 실패할 때 세션 정리 경로
7. logout API 실패 시에도 logout `finally` 정리 경로

매핑된 API key 분기:

1. API 키 생성 성공
2. API 키 이름 중복 충돌
3. 생성 후 목록 반영
4. 키 비활성화 상태 업데이트
5. 키 활성화 상태 업데이트
6. 키 삭제 성공
7. 키 삭제 not-found 분기

백엔드 전용(프론트 도달 불가) 분기는 백엔드 소유로 유지:

1. API-key 기반 `/auth/me` 인증 성공/거부 (`X-API-Key`)

## 9) 검증 체크리스트

커밋 전:

```bash
cd B4React
npm run format
npm run format:check
npm run test
npm run build
```

## 독립 빌드 규칙

`npm run build`, `build:web`, `build:desktop`은 모두 자체 `dist/`만 생성합니다. 부모 저장소로 파일을 복사하지 않습니다. API 타입 생성과 `build:sync`, `build:strict`는 로컬 계약을 사용합니다. 백엔드 패키징은 소비 저장소의 책임입니다.

## 사이드바 레이아웃 회귀 검증

`make test-ui`는 데스크톱·모바일 접힘/펼침 크기, 브랜드 호버와 토글 위치, 라이트·다크 배경 일치, 동작 줄이기, 작은 툴팁 닫힘, 프로필 팝오버 경계와 Escape, 메뉴 간격, 터치 영역을 검증합니다. DesktopTitleBar 컴포넌트 테스트로 네이티브 앱 드래그와 창 제어를 유지합니다.

설정 브라우저 검증은 공통 사이드바 메뉴, 앱 복귀 상태, 반응형 테마 미리보기와 시스템·라이트·다크 선택 저장을 확인합니다.

사이드바 너비 검증은 드래그, 화면 이동·새로고침 후 너비 저장, 키보드 범위, 프로필 팝업 너비 일치와 공통 설정 헤더를 확인합니다.

API 키 브라우저 검증은 실제 형태의 목록 메타데이터·상태, 모바일 표 내부 스크롤과 생성 창 경계를 확인합니다. 컴포넌트 검증은 생성·표시·토글·삭제와 6행 페이지 구성을 유지합니다.

단축키 단위 테스트는 운영체제별 표시, 정확한 조합키 및 입력·조합·모달 제외를
확인합니다. 브라우저 테스트는 Mac/Windows/Linux 단축키와 모바일·데스크톱의
드롭다운 버튼/메뉴 정렬을 검증합니다.

`make test-ui`는 공개 진입, 프로필 로그인, 제공자 활성/비활성, 이메일 우선 검증,
회원가입 모달, 게스트 설정 범위, Escape·포커스 제한과 반응형 범위를 검사합니다.
기존 컴포넌트 테스트는 로그인 성공·오류·인증 재전송과 API 키 모달 동작을 유지합니다.

복구 브라우저 검사는 빈 이메일 검증·발송 확인·회원가입 조건·재설정 토큰 누락
메시지와 쇼케이스 공용 인증 모달 미리보기를 확인합니다.

최근 계정 테스트는 저장 개수·중복·만료, 동의, OAuth 복귀 검증, 토큰 캐시 정리,
프로필 이미지 갱신, 삭제와 저장소 차단을 검사합니다. 브라우저에서는 기록 위치·선택·삭제,
로그인 상태를 유지하며 다른 계정 로그인 열기를 확인합니다.

게스트 설정 브라우저 테스트는 일반·모양 접근, 계정 메뉴 숨김, 직접 URL 접근 보정 및 계정 API 미호출을 검증합니다.

카탈로그 브라우저 테스트는 이름 검색·분류·빈 결과와 초기화·로컬 API 키 전환·OAuth 미리보기 격리·모바일 오버플로를 확인합니다. 하네스 테스트는 별칭 import, 누락 export, 이름만 같은 컴포넌트, 인라인 스타일, 별도 스타일 파일, 버튼 클래스 복제, 위치 계산 예외를 확인합니다.

페이지 상태 브라우저 테스트는 로딩 예시 종료·실제 잘못된 경로의 404 복귀·320/1440px 배치를 확인합니다. 하네스는 공용 배럴에서 빠진 UI export도 실패 사례로 검사합니다.

관리자 패널 테스트는 역할별 메뉴/경로 차단, 검색과 페이지 이동, 빈 결과/오류/재시도, 모바일/데스크톱 화면, 계정 변경 시 오래된 응답 차단과 데스크톱 복구를 검증합니다.

React 성능 검사는 `make react-performance-check` / `make check`에서 정적 규칙·작업 기록 정책의 통과/실패 fixture를 실행합니다. AdminPage 테스트는 검색 초안 입력 중 날짜 포맷 횟수를 확인하고 데이터·언어·로딩·오류 변경의 정상 갱신도 검증합니다. `make test-routes`는 프로덕션 청크의 지연 로딩·셸 유지·새로고침·홈 복구를 확인하며 필수 Frontend checks CI에서도 Chromium으로 실행합니다. 근거와 한계는 [성능 결정](react-performance.md)을 참고하세요.

## 프로젝트 브랜드 검증

`make project-config-check`는 공개 설정, HTML 이스케이프와 Tauri 설정 병합을 확인합니다. `make test-routes`는 프로덕션 빌드의 영어/한국어 제목, 브랜드 문구, 로고와 파비콘도 검증하며 `project.local.json`이 있으면 해당 값을 사용합니다. 부모 저장소 없이 기본/사용자 지정 설정을 모두 검증합니다.

`make style-studio-check`는 임시 파일에서 읽기/적용·백업·해시·입력/접근 검증을 확인합니다.
`make test-style-studio`는 모바일/데스크톱의 초안·취소·테마 분리·적용/충돌을 검증합니다.
브라우저 테스트의 쓰기는 모킹하여 개발자 CSS를 수정하지 않습니다. 컴포넌트 테스트는
렌더 분리/미리보기 정리를, 프로덕션 테스트는 편집 UI/파일 API 제외를 확인합니다.
