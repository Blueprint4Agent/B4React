# 검색과 페이지네이션

기존 `InputField`, `Button`, `Pagination`을 사용합니다. 화면은 `useCollectionQuery`로 쿼리 상태를 소유하고, 도메인 API 훅은 요청·취소·오류·계정 격리·데스크톱 및 실시간 복구를 소유합니다. 공통 훅에 HTTP나 별도 결과 저장소를 추가하지 않습니다.

## 공통 규칙

- 서버 검색은 기본적으로 Enter/검색 버튼으로 제출합니다. 입력 초안과 적용 검색어를 분리하여 입력만으로 요청하지 않습니다. 작은 로컬 카탈로그는 즉시 검색을 사용합니다. 서버 디바운스 검색은 명확한 필요와 이전 응답 차단 테스트가 있을 때 도입합니다.
- 적용 시 앞뒤 공백을 제거하고 빈 문자열은 검색 없음으로 처리합니다. 요청의 대소문자와 `%`/`_`는 그대로 보존하며 검색 대상과 대소문자 비교는 도메인이 결정합니다. 서버 입력은 `MAX_SEARCH_LENGTH`(200)로 제한하고 초과 검색어를 임의로 자르지 않습니다.
- 페이지는 1부터, 공통 크기는 기본 20, 범위는 1~100입니다. 기존 관리자 화면 10개, API 키·샘플 6개는 유지합니다. 검색 제출·필터·크기 변경 시 1페이지로 돌아갑니다. `reset()`은 초안·검색·필터·페이지를 초기화하고 선택한 크기는 유지합니다. 초기 옵션은 마운트 시 기본값이므로 이후에는 setter나 재마운트를 사용합니다.
- 계속 증가하는 목록은 서버 페이지네이션을 사용합니다. 로컬 페이지네이션에는 전체 목록이 필요합니다. 서버가 반환한 한 페이지를 다시 나누거나 그 안에서만 검색한 결과를 전체 검색처럼 표시하지 않습니다.
- 서버 응답은 `items`, 필터 적용 후 `total`, `page`, `page_size`와 도메인 추가 메타데이터로 구성합니다. 생성된 타입을 다시 선언하지 않습니다. 범위를 벗어난 요청은 요청 페이지·실제 total·빈 items를 반환하고, 화면이 성공 응답 후 페이지를 보정해 다시 요청합니다.
- 로딩 중 알 수 없는 total을 0으로 취급하지 않습니다. 응답 전에는 요청 페이지를 유지하며 알려진 total로만 보정합니다. 성공한 빈 결과의 UI 페이지는 1이고 한 페이지 이하의 컨트롤은 숨깁니다.
- 변경/새로고침 시 기본적으로 현재 페이지를 유지합니다. 기존 API 키 화면은 개수 변경 시 초기화하므로 개수를 명시적 `resetKey`로 전달합니다. 동일 개수 새로고침은 페이지를 유지합니다. 필터·계정 초기화가 필요한 로컬 목록은 원시값 키를 전달합니다.
- URL 저장은 자동 제공하지 않습니다. 현재 화면은 로컬 상태입니다. 공유 링크를 추가할 때 파라미터 검증, 뒤로/앞으로 이동 테스트, 민감 검색어 노출 여부를 검토합니다.
- 카드 슬롯·접근성 이름·`aria-current`·넘침 제한 규칙을 유지합니다. 필터와 정렬은 도메인이 소유하며 서버 정렬에는 고유한 동률 해소 키가 있어야 합니다.

## 서버 목록 사용법

`AdminPage`를 기준으로 생성된 `AdminUserQuery` 타입을 사용합니다.

```tsx
const list = useCollectionQuery({ initialFilters: { role: "all" }, pageSize: 10 });
const query = useMemo<AdminUserQuery>(
    () => ({
        page: list.page,
        page_size: list.pageSize,
        search: list.search,
        role: list.filters.role === "admin" ? "admin" : undefined,
    }),
    [list.page, list.pageSize, list.search, list.filters.role],
);
const { data } = useAdminUsers(ownerId, query);
const totalPages = data
    ? getPagination(data.total, list.pageSize, list.page).totalPages
    : Math.max(1, list.page);
useEffect(() => {
    if (data && list.page > totalPages) list.setPage(totalPages);
}, [data, list.page, totalPages, list.setPage]);
```

검색 form에서 `preventDefault()` 후 `list.submitSearch()`를 호출합니다. `InputField`에 `list.input`, `list.setInput`, `maxLength={MAX_SEARCH_LENGTH}`를 연결합니다. `list.setFilters(...)`에는 다음 필터 전체 객체를, 페이지 이동에는 `list.setPage`를 사용합니다. 초안은 API 쿼리 의존성에서 제외하고 기존 요청 취소·오래된 응답 차단을 유지합니다.

## 로컬 목록 사용법

```tsx
const list = useCollectionQuery({ initialFilters: {}, searchMode: "immediate" });
const filtered = useMemo(
    () =>
        items.filter((item) =>
            item.name.toLocaleLowerCase().includes(list.search.toLocaleLowerCase()),
        ),
    [items, list.search],
);
const pager = useClientPagination(filtered, 6, list.search);
// pager.visibleItems를 표시하고 page/totalPages/setPage를 Pagination에 연결합니다.
// 로컬 페이지는 pager가 소유하며 list.page는 사용하지 않습니다.
```

`useClientPagination`은 slice를 메모화하고 목록 축소 시 자식 커밋 전에 페이지를 보정합니다. 크기나 resetKey가 바뀌면 초기화합니다. 잘못된 total/크기는 프로그래밍 오류로 `getPagination`이 예외를 던집니다. 잘못된 요청 페이지는 1, 너무 큰 페이지는 마지막 페이지로 보정합니다.

## 기존 API 키 예외

현재 API는 개수 상한 없이 전체 키를 반환합니다. 이번 변경은 계약과 클라이언트 페이지네이션을 유지합니다. 확장 가능한 목록 예제로 사용하기 전 별도 공급자/소비자 계약 변경으로 서버 검색·페이지네이션을 도입해야 합니다.

## 검증

`make test`는 제출/즉시 검색·필터/크기 초기화·축소/빈 목록·명시적 초기화·메타데이터 경계를 검증합니다. 기존 관리자 입력 테스트는 메모화된 행 작업을, 도메인 훅 테스트는 이전 계정 응답과 데스크톱 복구를 보호합니다. `make test-ui`는 관리자 검색/페이지와 카탈로그/API 키 동작을 모바일·데스크톱에서 확인합니다.
