# 설치 소비 예제

컴포넌트가 없는 현재 단계에서 배포 CSS와 `/tokens` 진입점의 설치 계약을 확인합니다. 표시되는 색·간격·반경은 모두 교체 예정인 임시 토큰이며, 확정 디자인이 아닙니다.

각 예제는 워크스페이스에 포함하지 않는 독립 프로젝트입니다. 디자인 시스템 의존성은 `@themoment-team/design-system-react` 하나뿐입니다. 토큰 패키지를 직접 설치하거나 소스 경로로 우회하지 않습니다.

## 예제

### `vite-tailwind`

React + Vite + Tailwind v4 예제입니다. CSS import 순서를 유지합니다.

```css
@import 'tailwindcss';
@import '@themoment-team/design-system-react/styles.css';
@import '@themoment-team/design-system-react/tailwind.css';
```

`bg-brand-default`가 실제 토큰 변수 기반 유틸리티로 생성되는지 검증 스크립트가 빌드 CSS를 검사합니다. `tailwind.css`는 선택적 Tailwind 테마 매핑이며, 필수 기본 스타일인 `styles.css`를 대체하지 않습니다.

### `vite-styled-components`

Tailwind 의존성이 없습니다. JavaScript에서 필수 CSS를 한 번 가져오고, `/tokens`의 `vars`로 styled div를 만듭니다.

```js
import '@themoment-team/design-system-react/styles.css';
import { vars } from '@themoment-team/design-system-react/tokens';
```

`vars`는 CSS 변수 참조 문자열입니다. 예를 들어 `vars.color.brand.default`를 `background-color`에 넣습니다.

### `next-app-router`

App Router의 `app/layout.tsx`가 `globals.css`를 가져오고, 이 CSS가 `styles.css`를 가져옵니다. `app/page.tsx`는 `'use client'` 없는 **서버 컴포넌트**이며 `/tokens`에서 `vars`를 가져와 인라인 스타일에 사용합니다. 클라이언트 진입점인 패키지 루트는 사용하지 않습니다.

## 미발행 패키지 검증

저장소 루트에서 실행합니다. Node.js 22 이상과 루트 `packageManager`에 고정된 pnpm이 필요합니다.

```sh
pnpm install --frozen-lockfile
pnpm test:consumers
```

검증 스크립트는 다음을 수행합니다.

1. 두 패키지를 빌드하고 각각 `pnpm pack`으로 tarball을 만듭니다.
2. `$TMPDIR` 아래 저장소 밖의 새 임시 디렉터리에 각 예제를 복사합니다. 기존 `node_modules`, `dist`, `.next`, lockfile은 복사하지 않습니다.
3. 복사본의 React 패키지 의존성만 tarball 경로로 바꿉니다. 아직 발행되지 않은 전이 의존성인 tokens는 pnpm `overrides` 항목으로 tokens tarball에 연결합니다.
4. `pnpm install --ignore-workspace --no-frozen-lockfile` 후 실제 프레임워크 빌드를 실행합니다.
5. 세 예제의 `PASS`를 출력합니다. 설치·빌드·CSS 검사 중 하나라도 실패하면 종료 코드가 0이 아닙니다. 성공 여부와 무관하게 임시 디렉터리를 정리합니다.

pnpm 12는 `package.json`의 `pnpm.overrides`를 읽지 않고, `--ignore-workspace`는 `pnpm-workspace.yaml`도 건너뜁니다. 따라서 스크립트는 자식 프로세스에만 `PNPM_CONFIG_OVERRIDES`를 전달합니다. 소비 프로젝트의 직접 의존성에 tokens를 추가하지 않습니다. 같은 방식으로 `PNPM_CONFIG_ALLOW_BUILDS`에서 Vite 도구 체인의 `esbuild` 빌드만 허용하며, 사용자 전역 설정은 변경하지 않습니다.

실제 설치는 외부 프레임워크 의존성을 받기 위한 레지스트리 접근이 필요합니다. 디자인 시스템 두 패키지는 로컬 tarball을 사용하며 발행하지 않습니다. 원본 예제의 `0.0.0`은 현재 패키지 버전입니다. 발행 전에는 예제 디렉터리에서 바로 설치하는 대신 위 검증 명령을 사용하세요. 예제의 버전은 모두 정확한 버전으로 고정했습니다.

검증 과정에서 워크스페이스 안에 `node_modules`나 빌드 산출물을 만들지 않으므로 루트 lint·format 대상에 생성 파일을 추가하지 않습니다.
