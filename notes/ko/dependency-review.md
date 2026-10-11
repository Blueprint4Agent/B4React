# 의존성 검토

[English](../dependency-review.md)

Node.js 24와 커밋된 lockfile을 사용하는 `npm ci`로 설치하세요. 2026년 10월 공개
준비 검토에서 기존 lockfile의 npm audit 경고 13건을 확인했으며 개발용 테스트 도구도
포함됐습니다. 호환 범위의 의존성 갱신과 명시적인 Vitest 4.x 이전으로 검토 시점의
경고를 해소합니다. React와 상태 소유 구조는 변경하지 않습니다.

`npm audit`와 `npm audit --omit=dev`를 함께 실행해 전체 도구 체인과 운영 의존성을
구분하세요. 경고 수는 시간에 따라 달라지며 앱의 실제 악용 가능성이나 알려지지 않은
취약점의 부재를 증명하지 않습니다. 수정 내용을 검토하고 lockfile을 커밋한 뒤
`make verify-plan`, `make verify`를 실행하세요. 회귀 근거 없이 주요 버전을 강제 갱신하지 마세요.

Vitest 4는 프로젝트의 Vite 6·Node 24 환경을 지원합니다. 명시적인 테스트 include와
기존 mock/reset 구성을 유지하며 [공식 이전 가이드](https://v4.vitest.dev/guide/migration.html)를
참고하세요. 기존 단위·통합·브라우저 UI·경로 복구·Style Studio 검증으로 호환성을 확인합니다.

관리자 렌더 격리 테스트의 생성자 spy는 원래 Intl.DateTimeFormat 생성자를 호출합니다. Vitest 4에서도 실제 포맷터를 유지하며 기존 불필요한 렌더 방지 검증을 보존합니다.
