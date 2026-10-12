# 공개 링크 공유 메타데이터

[English](../sharing.md)

Vite HTML 변환은 JavaScript 실행 전부터 읽을 수 있는 description·Open Graph·Twitter 메타데이터를 빌드 결과에 넣습니다. 제목은 project.local.json을 따릅니다. 기본 설명은 블루프린트를 소개하며, 사용자 프로젝트는 설정한 이름을 포함한 일반 설명을 사용합니다.

`.env.production` 또는 빌드 환경에 공개 값을 설정한 뒤 다시 빌드하세요.

```dotenv
VITE_PUBLIC_SITE_URL=https://your-domain.example
VITE_SITE_DESCRIPTION=서비스 소개 문구를 입력하세요.
```

URL은 자격 증명·하위 경로·쿼리·fragment가 없는 HTTP(S) origin이어야 합니다. 비워두면 공유 URL·이미지 태그를 생략합니다. origin을 설정하면 기본 배너의 절대 URL을 만듭니다. 사용자 프로젝트는 설정된 PNG/JPEG/WebP 로고를 사용하며, SVG 또는 로고 미설정 시 템플릿 배너 대신 이미지 태그를 생략합니다. 해당 공개 자산을 설정한 주소에서 제공해야 합니다.

공개 빌드 설정에 비밀값을 넣지 마세요. 컨테이너는 프론트엔드 빌드 단계에 값을 전달해야 합니다. 이미지 빌드 후 백엔드·컨테이너 실행 환경만 바꾸면 HTML은 갱신되지 않습니다. 사이트 공통 메타데이터이며 경로별 렌더링·canonical 정책·온라인 데모·검색 색인 및 공유 카드 노출 보장이 아닙니다. 배포 후 공유 미리보기 캐시를 갱신해야 할 수 있습니다.

`make verify-plan`, `make verify`로 검사합니다. 빌더 테스트는 escaping·origin 거부·프로젝트 이름 격리를 확인하고, 프로덕션 테스트는 앱 JavaScript 실행 없이 원본 HTML 응답을 검사합니다.

검색 가능한 프로젝트 소개는 [공개 검색 노출](discovery.md)을 참고하세요.
