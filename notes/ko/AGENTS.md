# 에이전트 가이드

[English](../../AGENTS.md)

`AGENTS.md` → `FRONTEND.md` 순서로 읽고, 테스트를 수정할 때는 `TEST.md`도 읽습니다.

B4React는 백엔드 저장소가 Git 서브모듈로 특정 커밋을 고정해 사용하는 독립 프론트엔드입니다.
설치·생성·검사·테스트·빌드 과정에서 부모 저장소를 읽거나 쓰지 않습니다.
로컬 API 계약은 `contracts/openapi.json`입니다. `make api-generate`로 재생성하고
`make api-check`로 일치 여부를 확인합니다.

## 검증과 문서

커밋 전에는 `make verify-plan` 다음 `make verify`를 실행합니다. 기본 HEAD 비교는
스테이징·미스테이징·미추적 변경을 포함하며, 전체 브랜치를 검토할 때는 `VERIFY_BASE`를 지정합니다.
일반 문서와 구조가 같은 번역 문구는 텍스트/JSON 검사, 동작은 정적·테스트·빌드,
UI는 필요한 브라우저 검사, 보호·불명확한 변경은 전체 검증을 선택합니다.
`VERIFY_FULL=1 make verify`로 확대할 수 있습니다. 자세한 조건은 [검증 정책](verification.md)을 따릅니다.

동일 내용에 통과한 검사는 부모 위임 검사를 포함해 반복하지 않습니다. 선택/생략한 검사와
이유를 기록하고 관련 후속 수정은 같은 작업 PR에서 마무리합니다. 로그는 요약과 실패 부분부터
확인합니다. Git 규칙과 병합 보호는 유지합니다. 한국어 문서는 `notes/ko/`에서 영어 문서와
동기화합니다. `FRONTEND.md`의 API 상태·실시간 갱신·데스크톱 복구·UI 조합 루프를 확인하고,
적용하지 않는 루프는 이유를 워크로그에 기록합니다.

## Git 규칙

브랜치는 `<type>/<kebab-description>`, 커밋 제목은 Conventional Commits를 사용합니다.
새 커밋마다 `worklog/NNNN-description.md`가 있어야 하며 Commit Title, Changed File Scope,
Reason, Impact와 검증 결과를 기록합니다. 단순하지 않은 커밋 본문에는 `Changes:`,
`Affected Files:`, `Verification:`이 필요합니다.

`make git-governance-check`에 필요한 COMMIT_TITLE, COMMIT_BODY_FILE, PR_TITLE,
PR_BODY_FILE을 전달해 계획한 메타데이터를 검사합니다. PR 제목은 `[type] Description`,
본문은 Summary, Scope, Reason, Verification, Documentation, Risk / Impact 섹션을 사용합니다.
기본은 리뷰 가능한 PR이며 merge commit으로 병합합니다. 자동 병합도 `gh pr merge --auto --merge`를
사용하고 등록된 병합 방식을 확인합니다. Squash/rebase는 사용자가 명시적으로 요청한 경우만 허용합니다.

과거 이력은 `git subtree split`으로 가져왔으며 워크로그 규칙은 이 저장소의 새 커밋에 적용합니다.

## 작업 시작과 완료 순서

1. 가이드와 작업 트리/서브모듈 상태를 확인하고 무관한 변경을 보존합니다.
2. 구현 전에 현재 대상 브랜치에서 이름 있는 작업 브랜치를 만듭니다.
3. `.github/WORKLOG_TEMPLATE.md`를 다음 번호의 `worklog/NNNN-description.md`로 복사합니다.
   구현 전에 커밋 제목·이유·범위·설계·검증 계획·루프 영향을 작성합니다.
4. 구현과 관련 문서를 함께 수정하고 범위가 달라지면 계획도 갱신합니다.
5. 루트 Make 검사를 실행합니다. 생략한 검사와 이번 작업의 이유를 기록하며,
   과거 테스트 생략 요청을 영구 면제로 취급하지 않습니다.
6. 완료된 워크로그와 변경 파일을 스테이징한 뒤 다음 명령을 실행합니다.

    ```sh
    COMMIT_TITLE='type(scope): summary' COMMIT_BODY_FILE=/tmp/commit.txt make git-governance-check
    ```

    계획 검증은 미추적·미스테이징 파일이 아닌 Git index를 읽습니다. 스테이징이 바뀌면 다시 검사합니다.

7. 커밋·푸시 후 리뷰 가능한 PR을 생성합니다. PR_TITLE과 PR_BODY_FILE은 함께 검사합니다.
8. 로컬 훅과 실제 PR 메타데이터를 병합 전에 확인합니다. 자동 병합이 등록돼 있다면 MERGE 방식을 확인합니다.

템플릿의 Design, Verification Plan, Loop Alignment, Verification도 필수입니다.
각 작성 커밋의 워크로그 Commit Title은 해당 커밋과 정확히 일치해야 합니다.
이력 통합 merge commit은 커밋별 워크로그 검사에서 제외합니다. Git은 계획 작성 시점을 증명하지
못하므로 시작 시 계획은 작업자의 의무입니다. 로컬 규칙은 기록과 메타데이터를 확인하며 설계의
정확성을 증명하지 않습니다.

## 로컬 규칙과 수동 GitHub 워크플로

clone마다 `make hooks-install`을 한 번 실행합니다(`make init`에도 포함).
부모 B4FastAPI 설치기는 초기화된 프론트 서브모듈에도 훅을 설치합니다.
기존 사용자 지정 `core.hooksPath`는 보존하므로 별도 조정이 필요합니다.

`commit-msg`는 실제 메시지와 스테이징된 워크로그를 검사하며 통합 merge commit은 제외합니다.
`pre-push`는 작업 트리/서브모듈이 깨끗하고 푸시 대상이 현재 HEAD인지 확인합니다.
원격 main을 가져와 merge-base 이후 모든 작성 커밋과 전체 브랜치 범위의
`make verify-plan`·`make verify`를 검사합니다. 실패하면 푸시를 막으며 일반 작업에서 우회하지 않습니다.

PR 메타데이터 생성/수정 후와 병합 직전에 `PR_NUMBER=<번호> make git-governance-pr-check`를
실행합니다. 실제 GitHub 제목/본문과 전체 커밋 범위를 로컬에서 확인합니다.
PR_TITLE/PR_BODY_FILE 사전 검증도 사용할 수 있습니다. GitHub에서 수정한 메타데이터는
로컬 훅을 실행하지 않으므로 병합 직전 재확인이 필요합니다.

이미지·데스크톱을 포함한 GitHub 워크플로는 workflow_dispatch 수동 실행만 허용합니다.
PR·push·예약·태그·릴리스 자동 실행은 없습니다. main은 PR과 대화 해결을 요구하고
삭제/비 fast-forward 갱신을 보호하며 필수 승인 수는 0입니다. 필수 CI 상태 검사는 로컬/원격
ruleset에서 제거돼 있습니다. 로컬 훅은 우회 가능하므로 서버 CI 보장이 아닙니다.
PR·이력 보호를 끄지 않으며 ruleset 변경에는 관리자 권한이 필요합니다.

성공한 Make 결과는 내용에 결합된 로컬 receipt로 최대 24시간 재사용합니다.
코드·문서·설정·도구/환경·필수 빌드 산출물이 같아야 하며, worklog 결과만 수정해도
텍스트와 거버넌스는 검사합니다. CI/수동 Actions와 `VERIFY_FULL=1`은 receipt를 사용하지 않습니다.
[로컬 훅](local-hooks.md)을 참고하세요.

## 공용 UI 하네스

`make check`와 `make architecture-check`는 `make ui-composition-check`를 포함합니다.
공용 UI 값을 export할 때는 실제로 렌더되는 쇼케이스 예시를 추가합니다.
스타일은 `src/styles/app.css`에서 관리하고 버튼 클래스 복사 대신 Button을 재사용합니다.
인라인 geometry 예외는 검사기와 프론트 가이드에 좁게 기록합니다.
공용 컨트롤 수정 시 카탈로그 커버리지와 모바일 레이아웃도 확인합니다.

## React 최적화 기본 절차

런타임·상태 라이브러리 변경 전 [상태·성능 정책](react-performance.md)을 읽습니다.
상태 소유권을 먼저 정하고, 같은 props를 자주 받는 반복/비용 있는 자식 경계에는 기본적으로
React.memo를 검토합니다. 적용 효과가 없으면 이유를 기록합니다. 필요한 경우 참조를 안정화하되
일괄 memo나 근거 없는 Zustand/Redux 도입은 하지 않습니다. 독립 최적화는 별도 브랜치·워크로그·PR로 진행합니다.

런타임/의존성 수정 전 State Ownership, Memoization, Performance Evidence를 작성하고
구현 후 실제 근거로 갱신합니다. Git 규칙은 같은 스테이징/커밋의 기록을 검사합니다.
`make react-performance-check`는 check/architecture-check에 포함됩니다.
`make test`는 생략 가능한 작업과 필요한 갱신을 보호하고, 라우팅/빌드는 `make test-routes`,
UI는 `make test-ui`로 확인합니다. 로컬 전체 검증은 프로덕션 라우트 복구도 포함합니다.
의도적인 보호 경계 변경은 근거를 갱신하며 통과를 위해 검사를 끄지 않습니다.

모든 UI 변경은 [페이지 유형별 일관성](page-families.md)을 따릅니다. 구현 전에 기존 비교 화면을
정하고 조합 규칙을 재사용하며 워크로그 Page Family에 실제 레이아웃 비교를 남깁니다.
공용 컨트롤 검사만으로 페이지 일관성이 증명되지는 않습니다.
