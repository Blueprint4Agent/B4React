# 메인 페이지 템플릿

[English](../main-page-template.md)

두 모드의 기본 화면인 `HomePage`가 로그인 상태에 따른 목적지와 역할별 메뉴를 처리하고 `src/components/layout/MainPageTemplate`은
배치만 담당합니다. 템플릿은 인증·API·라우팅 상태·저장소를 소유하지 않습니다.
`AppLayout` 안에서 사용하며 `/home`은 설정 페이지 계열의 셸 여백을 공유합니다.
같은 계열의 페이지를 추가할 때 새 경로에도 동일한 셸을 적용하세요.

- `title`, `description`, `icon`: 제목 영역.
- `actions`: 상단 액션. 기존 `Button`, `DropdownMenu` 등을 배치합니다.
- `menuLabel`, `menuItems`: 접근성 이름과 메뉴 목록. 고유 ID, 경로, 제목,
  선택적인 설명·아이콘을 전달합니다. 역할 필터는 페이지에서 처리합니다.
- `menuLayout`: 기본 `list` 또는 반응형 `grid`.
- `children`: 추가 섹션·목록·카드·위젯과 로딩·오류·빈 상태를 배치합니다.

```tsx
<MainPageTemplate
    title="워크스페이스"
    description="오늘의 작업을 시작하세요."
    actions={<Button onClick={createProject}>프로젝트 만들기</Button>}
    menuLabel="워크스페이스 메뉴"
    menuLayout="grid"
    menuItems={items}
>
    <ProjectList />
</MainPageTemplate>
```

위의 `items`, `createProject`, `ProjectList`는 확장 방법을 보여주는 예시이며 기본
제공 기능은 아닙니다. 데이터 요청은 해당 훅·페이지에서 처리하고 서버 권한 검사를
유지하세요. 실제 홈에 가짜 통계를 넣지 않습니다.

개발 쇼케이스의 `MainPageTemplate` 예시는 그리드 메뉴·상단 액션·추가 콘텐츠 배치를
보여줍니다. 두 모드의 홈은 리스트 배치와 실제 설정 메뉴를 사용합니다. 설정 셸·헤더·행의
디자인 토큰을 유지하고 배치 스타일은 `src/styles/app.css`에서 관리합니다.
