# 고정된 B4 API 계약

타입 생성 입력은 자체 `contracts/openapi.json`이고 출처는 `contracts/source.json`입니다.
검토된 제공자 스냅샷과 출처를 갱신하고 `make api-generate`, `make check test build`를 실행합니다.
스키마·생성 타입·호출부 변경을 함께 B4React PR에 반영한 뒤 부모의 서브모듈 포인터를 갱신합니다.
부모는 자신의 계약과 JSON 의미상 일치를 검사하며 설치·빌드 중 프론트 계약을 덮어쓰지 않습니다.

현재 동작 기준은 `source.json`에 고정된 B4FastAPI 커밋의 `contracts/README.md`입니다.
경로·operation ID·에러 코드·쿠키/bearer 인증·OAuth 리다이렉트·readiness·SSE 동작이 같아야 합니다.
OpenAPI 일치만으로 런타임 호환성이 입증되지는 않습니다. 기존 refresh-token·realtime 제한은 유지합니다.
Spring Boot 구현 시 제공자 중립 계약 저장소로 승격할 수 있습니다.

## 관리자 사용자 목록

`GET /api/v1/auth/admin/users`는 DB 역할이 `admin`인 사용자만 접근합니다.
bootstrap 관리자도 같은 권한 검사를 적용합니다. `page`(1 이상), `page_size`(1~100,
기본 20), `search`(이름/이메일의 문자 그대로 검색, 최대 200자), `role`, `is_active`
필터를 지원합니다. 사용자 ID 내림차순 목록, 필터 결과 수와 전체 계정 통계를 반환합니다.
사용자 정보·역할·계정 활성/이메일 인증 여부·가입일·로그인 방식과 연결된 인증 수단 중
가장 최근 성공 로그인 시각을 제공합니다. 기록이 없으면 null입니다.
활성은 계정 사용 가능 상태이며 현재 접속 여부가 아닙니다. IP, 사용자 에이전트,
비밀번호, 토큰, 제공자 식별자는 제외합니다. 전체 로그인 이력이나 실시간 접속 추적이
아닌 조회용 스냅샷이며 역할 변경 API는 추가하지 않습니다.

## 결제 기반

추가된 `/api/v1/billing` 계약은 bearer 또는 앱 API 키 인증 설정, Stripe 제공 등록 세션/상태,
카드·Link 커서 목록을 정의합니다. `useBillingApi`는 자동 요청이나 캐시 없이 타입
API와 알려진 오류 코드 추출을 제공합니다. 후속 화면은 작업별 UUID를 재시도에
재사용하고 상태 API의 `registered`를 확인하며 복귀·계정·연결 변경 시 재조회해야
합니다. 결제 화면이나 Stripe.js는 추가하지 않습니다. Stripe가 상태 원본이며
웹훅·실시간 알림·실제 청구 기능은 포함하지 않습니다.
