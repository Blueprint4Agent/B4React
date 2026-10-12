# 공개 검색 노출

[English](../discovery.md)

기존 `/home` 앱을 유지합니다. 선택적으로 빌드하는 `/about/`(영어)와
`/about/ko/`(한국어)는 기능, 로컬 설치, 설정 범위, 소스·문서 링크를 정적 HTML로
제공합니다. Blueprint4Agent(B4A)는 상위 이름이며 Blueprint4FastAPI가 백엔드와
고정 버전 B4React를 결합합니다.

```dotenv
VITE_PUBLIC_DISCOVERY=true
VITE_PUBLIC_SITE_URL=https://blueprint4agent.org
# 선택 항목: 공개 소유 확인값이며 인증 비밀값이 아닙니다.
VITE_INDEXNOW_KEY=
```

`make build`로 다시 빌드합니다. 기본 템플릿 이름과 유효한 공개 origin이 필요합니다.
사용자 지정 `project.local.json`이 있으면 다른 서비스를 B4A로 홍보하지 않도록
빌드를 거부합니다. 비활성 빌드는 기존 공유 메타데이터와 앱 동작을 유지합니다.
공개 HTML, robots.txt, sitemap.xml, discovery-manifest.json을 생성하고, 키가 있으면
/<key>.txt로 제공합니다. 매니페스트는 CSS 번들명 대신 콘텐츠 지문을 저장하며
가짜 갱신 시각이나 비공개 앱 데이터를 포함하지 않습니다.

각 언어에 자기 주소 canonical, 상호 en/ko hreflang, 영문 x-default를 지정합니다.
Sitemap에는 소개 URL만 포함합니다. 이 모드의 앱 HTML은 `noindex, follow`이며,
봇이 noindex를 읽을 수 있도록 robots.txt에서 접근 자체는 허용합니다.
OAI-SearchBot, Claude-SearchBot, Claude-User, PerplexityBot과 일반 검색 봇은
허용하고 GPTBot·ClaudeBot은 차단합니다. 크롤링 정책이며 접근 제어나 모든 경로의
학습 방지 수단은 아닙니다. AI 인용을 보장하지 않으며 llms.txt를 요구하지 않습니다.

소개 페이지는 홈의 제목·기능 행·미리보기 스타일과 이미지를 재사용합니다.
유일한 스크립트는 시스템 밝은/어두운 테마를 따릅니다. JavaScript를 꺼도 본문,
링크와 언어 전환은 작동하며 밝은 테마로 표시됩니다. React, /config, 계정 API를
호출하지 않습니다. 기본 브랜드의 Vite 개발 서버에서도 별도 설정 없이 같은
/about/ 주소로 확인할 수 있습니다. 개발 응답에는 noindex 헤더를 붙이고 canonical은
생략합니다. 빌드 결과는 `make build`와 `npm run preview`로 확인합니다. 호스트는 없는 소개 URL에 SPA 대신 404를 반환해야 합니다.

`make test-discovery`는 별도 .discovery-dist 빌드로 정적 HTML, 언어 링크,
스크립트 없는 읽기, 메타데이터, 키 파일, 모바일 넘침과 홈 공통 스타일을
390/1440px·밝은/어두운 테마에서 검사합니다. `make test-routes`에도 포함합니다.
사용자 브랜드 빌드는 템플릿 페이지 대신 거부 규칙을 확인합니다.
Node 검사는 `make project-config-check`에 포함합니다.

검색 도구 소유 확인, WAF, 제출, 운영 배포는 운영자의 작업입니다. IndexNow 도구와
배포 인자는 소비하는 백엔드 저장소가 소유하며, B4React는 부모 설정을 읽거나
URL을 제출하지 않습니다.
