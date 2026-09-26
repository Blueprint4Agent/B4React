# B4React

B4 API 계약을 구현하는 백엔드가 함께 사용하는 React + TypeScript 프론트입니다.
B4FastAPI의 `src/frontend` 이력을 `git subtree split`으로 보존했습니다.

[English](../../README.md) · [개발 규칙](FRONTEND.md) · [테스트 규칙](TEST.md)

## 실행

Node.js 24와 npm을 사용합니다. 이 저장소에서 실행합니다.

```sh
make install init
make dev
make check test build
```

Vite는 5173 포트를 사용합니다. `.env`의 `VITE_API_BASE_URL`로 API 주소를 지정합니다.
개발 기본 API 포트는 8000이고 배포 웹은 같은 origin을 사용합니다.
Spring Boot가 8080에서 실행되면 `VITE_API_BASE_URL=http://localhost:8080`을 설정하고
동일한 인증·에러·SSE 계약을 구현해야 합니다. 교차 origin은 서버의 CORS·쿠키 설정이 필요합니다.

## 계약과 배포

로컬 `contracts/openapi.json`이 타입 생성 기준이고 `contracts/source.json`이 출처를 기록합니다.
`make api-generate`로 생성하고 `make api-check`로 변경 누락을 검사합니다.
실행 서버나 부모 저장소를 참조하지 않습니다. `build:sync`, `build:strict`도 로컬 계약을 사용합니다.
[동작 계약](contracts/README.md)을 함께 확인하세요.

`make build`는 자체 `dist/`만 생성합니다. B4FastAPI의 `make frontend-package`와 `make build`가
백엔드 정적 경로에 패키징합니다. 별도 웹 호스팅은 `dist/`를 직접 배포할 수 있습니다.

## 서브모듈

부모 저장소는 `src/frontend`에 특정 커밋을 고정합니다.

```sh
git clone --recurse-submodules https://github.com/Blueprint4Agent/B4FastAPI.git
# 기존 체크아웃
git submodule update --init --recursive
```

프론트 변경은 B4React의 이름 있는 브랜치와 PR에서 먼저 머지하고,
부모 PR에서 gitlink를 갱신한 뒤 계약 검사를 실행합니다. CI에서는 `--remote`를 사용하지 않습니다.
각 백엔드는 호환되는 프론트 커밋을 독립적으로 선택합니다.

## 데스크톱

`make desktop-dev`, `make desktop-build`는 Rust와 플랫폼별 Tauri 의존성이 필요합니다.
패키지 빌드 전에 `VITE_API_BASE_URL`을 지정하고 서버에서 webview origin을 허용하세요.
기존 설치 앱의 식별자를 유지하기 위해 B4FastAPI 제품명·bundle ID를 보존합니다.
데스크톱 릴리스 워크플로는 현재 부모 저장소가 소유합니다. 인증과 데이터 작업에는 서버 연결이 필요합니다.

## 기여

[AGENTS.md](../../AGENTS.md)를 따릅니다. 신규 커밋마다 worklog와 `make check test build` 결과를 기록합니다.

## 작업 절차와 PR 검사

가이드와 작업 상태 확인 → 작업 브랜치 생성 → [워크로그 초안](../../.github/WORKLOG_TEMPLATE.md)
작성 → 구현 → Make 검사 → 결과 기록·스테이징 → Git 규칙 검사 → 커밋·PR 순으로 진행합니다.
워크로그에는 설계, 검증 계획, 관련 루프와 실제 검증 결과를 기록합니다.

`make git-governance-check`는 COMMIT_TITLE을 전달하면 스테이징된 파일과
COMMIT_BODY_FILE을 검사하고, 전달하지 않으면 HEAD 커밋을 검사합니다.
PR_TITLE과 PR_BODY_FILE은 함께 전달합니다. 미추적 워크로그는 인정하지 않습니다.
PR CI는 실제 커밋 범위의 각 일반 커밋과 워크로그 제목·필수 내용을 검사하며,
PR 제목·본문을 수정해도 다시 실행됩니다. 브랜치 통합용 merge commit은 제외합니다.
Python 3 표준 라이브러리만 사용합니다. 구체적인 절차는 [AGENTS.md](../../AGENTS.md)를 참고하세요.

main은 PR과 Git governance 및 저장소별 코드 검사를 요구합니다. 1인 작업을 지원해
필수 승인 수는 0이며, 자동 검사는 사람의 설계 리뷰를 의미하지 않습니다.
워크로그를 작업 시작 시 작성하는지는 절차로 관리하고, CI는 커밋된 기록을 검증합니다.
