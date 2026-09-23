# 고정된 B4 API 계약

타입 생성 입력은 자체 `contracts/openapi.json`이고 출처는 `contracts/source.json`입니다.
검토된 제공자 스냅샷과 출처를 갱신하고 `make api-generate`, `make check test build`를 실행합니다.
스키마·생성 타입·호출부 변경을 함께 B4React PR에 반영한 뒤 부모의 서브모듈 포인터를 갱신합니다.
부모는 자신의 계약과 JSON 의미상 일치를 검사하며 설치·빌드 중 프론트 계약을 덮어쓰지 않습니다.

현재 동작 기준은 `source.json`에 고정된 B4FastAPI 커밋의 `contracts/README.md`입니다.
경로·operation ID·에러 코드·쿠키/bearer 인증·OAuth 리다이렉트·readiness·SSE 동작이 같아야 합니다.
OpenAPI 일치만으로 런타임 호환성이 입증되지는 않습니다. 기존 refresh-token·realtime 제한은 유지합니다.
Spring Boot 구현 시 제공자 중립 계약 저장소로 승격할 수 있습니다.
