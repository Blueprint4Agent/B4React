# Commit Title

feat(branding): readProjectConfig 기반 브랜드와 기본 언어 적용

# Changed File Scope

공개 project-config 검증/HTML 처리, i18n과 언어 결정 유틸리티, 쇼케이스 브랜드 props, 관련 테스트와 README/TEST 문서를 변경합니다. worklog/0104의 기존 밑줄 한 곳은 Prettier 규칙에 맞게 escape하는 형식 수정만 포함합니다.

# Reason

설정된 프로젝트에서 기존 브랜드/언어가 남지 않도록 기존 readProjectConfig와 **PROJECT_BRAND** 경로를 일관되게 사용합니다. 설정이 없으면 템플릿의 기존 값과 브라우저 언어 감지를 유지해야 합니다.

# Design

선택 default_language=en|ko를 검증합니다. 저장된 언어 선택 > 프로젝트 기본값 > 브라우저 언어 > 영어 순으로 결정하고 HTML lang을 맞춥니다. 환영 알림은 브랜드 interpolation을 사용하고 쇼케이스 아바타도 설정된 이름/로고를 사용합니다. 원본 미리보기 이미지는 원본 템플릿임을 표시합니다. 테스트는 명시적 문구 언어와 실제 신규 진입 기본값 검사를 분리합니다.

# Verification Plan

루트 make verify-plan/make verify 및 부모의 격리 project-build-test로 기본/사용자 지정 브랜드·동일한 이름/짧은 이름·한국어 기본·저장된 영어 선택·favicon·HTML lang을 검증합니다. 사용자 지정 프로젝트가 원본 공개 소개를 노출하지 않는지도 확인합니다.

# Impact

Test 전용 설정이나 소스는 추가하지 않습니다. 기존 계약/인증/상태 라이브러리/레이아웃을 유지하며 설정 없는 기본 템플릿은 호환됩니다.

# Loop Alignment

API state/realtime/desktop recovery 루프는 변경하지 않습니다. UI composition은 기존 UserAvatar/EditableAvatar를 유지하고 브랜드 props만 연결합니다.

# State Ownership

언어는 i18next, 사용자 선택은 기존 base-path scoped localStorage가 계속 소유합니다. 프로젝트 기본값은 검증된 불변 빌드 입력입니다. 별도 상태 저장소를 만들지 않습니다.

# Memoization

새 반복 렌더 경계나 고비용 연산이 없으므로 React.memo 추가 대상이 없습니다. 기존 컴포넌트 구조와 memo 경계는 유지합니다.

# Performance Evidence

성능 개선을 주장하지 않습니다. 설정 유무와 locale 우선순위의 회귀 및 기존 앱 검증으로 동작을 확인합니다.

# Page Family

## Family

기존 쇼케이스/공유 아바타와 홈 미리보기 계열입니다.

## Reference

src/pages/main/ShowCasePage.tsx의 기존 UserAvatar/EditableAvatar와 BrandMark입니다.

## Shared Rules

셸·간격·크기·표면·타이포그래피·반응형 구성을 그대로 사용합니다.

## Exceptions

레이아웃 예외 없음. 사용자 지정 이름/이미지 props와 출처 안내만 달라집니다.

## Evidence

루트 위임 make test-ui의 253개 기존 UI/동료 페이지 비교와 프로덕션 브랜딩 검사(390px dark, 1440px light, en/ko)가 통과했습니다. 동일 검사를 기본 및 격리 사용자 지정 브랜드에서 실행해 제목·wordmark·양쪽 로고·favicon·쇼케이스 아바타·가로 overflow를 확인했습니다. 레이아웃/CSS 변경은 없습니다.

# Verification

- Test 전용 변경을 롤백한 뒤 공통 개선만 적용했습니다.
- 부모 루트 make verify-plan/make verify(run-pjhr609t)가 자식 전체 계획을 위임 실행해 통과했습니다. 정적/도구/검증 하네스, 단위·컴포넌트·통합 212건, UI 253건, 기본 프로덕션 18건을 통과했습니다.
- 부모 project-build-test의 독립 복제본에서 동일한 이름/짧은 이름, 사용자 로고와 한국어 기본값으로 212건과 프로덕션 18건을 통과했습니다. 원본 작업공간에는 project.local.json을 생성하지 않았습니다.
- 기존 API/인증/회복/컴포넌트 코드는 변경하지 않았지만 전역 i18n과 테스트 공통 입력에 영향을 주므로 넓은 회귀를 유지했습니다. native packaging은 네이티브 구현을 변경하지 않아 생략했습니다.
- Git 거버넌스와 pre-push는 동일 내용에 대한 위임 검증 근거를 재사용하며 text/governance는 다시 확인합니다.
