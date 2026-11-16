# @themoment-team/design-system-react

themoment 디자인 시스템의 React 패키지입니다. 컴포넌트를 쓰는 프로젝트는 이 패키지 하나만 설치합니다.

> **아직 컴포넌트가 없습니다.** 지금은 패키지 빌드·배포 구조만 갖춘 상태이고, 포함된 토큰 값은 모두 placeholder입니다. 컴포넌트와 실제 토큰은 새 디자인 시스템이 확정된 뒤 추가합니다. npm에도 아직 배포하지 않았습니다.

## 설치

```sh
pnpm add @themoment-team/design-system-react
```

- 필수 peer: `react`, `react-dom` (`^18 || ^19`)
- 선택 peer: `tailwindcss` (`^4`, Tailwind를 쓰는 프로젝트만)
- 토큰 패키지(`@themoment-team/design-system-tokens`)는 의존성으로 함께 설치되므로 따로 설치하지 않습니다. `@base-ui/react`는 첫 컴포넌트를 추가할 때 의존성에 넣습니다.
- ESM 전용 패키지입니다. CommonJS 빌드는 제공하지 않습니다.

## 사용

### 1. 스타일 불러오기 (필수)

앱 진입점에서 한 번만 불러옵니다.

```ts
import '@themoment-team/design-system-react/styles.css';
```

`styles.css`는 Tailwind 문법이 없는 일반 CSS라서 Tailwind를 쓰지 않는 프로젝트에서도 그대로 동작합니다.

### 2. Tailwind v4와 함께 쓰기 (선택)

`tailwind.css`는 토큰을 Tailwind 테마에 연결하는 `@theme inline` 매핑입니다. 불러오면 `bg-brand-default`, `p-4` 같은 유틸리티가 `--tm-*` 토큰 값을 참조합니다.

```css
@import 'tailwindcss';
@import '@themoment-team/design-system-react/styles.css';
@import '@themoment-team/design-system-react/tailwind.css';
```

`styles.css`가 Tailwind v4와 같은 레이어 순서를 선언하므로 `tailwindcss`와 `styles.css` 중 어느 쪽을 먼저 불러와도 레이어 순서는 같습니다.

### 3. 토큰 상수

```ts
import { values, vars } from '@themoment-team/design-system-react/tokens';

const color = vars.color.brand.default; // 'var(--tm-color-brand-default)'
const source = values.color.brand.default; // 변환 전 DTCG 값
```

`/tokens`는 토큰 패키지의 `vars`·`values`를 그대로 다시 내보냅니다. 클라이언트 전용 지시문이 없어서 서버 컴포넌트에서도 값을 읽을 수 있습니다.

### 4. 패키지 진입점

```ts
import { version } from '@themoment-team/design-system-react';
```

지금은 `version` 상수만 내보냅니다. 진입점 파일은 `"use client"`로 시작하므로 Next.js App Router에서는 클라이언트 모듈로 취급됩니다.

### 토큰 값 바꾸기

토큰은 `theme` 레이어 안에 선언되어 있어, 레이어 밖에서 다시 선언하면 그 값이 우선합니다.

```css
:root {
  --tm-color-brand-default: #0055ff;
}
```

## 공개 경로

| 경로             | 파일                                 | 내용                                    |
| ---------------- | ------------------------------------ | --------------------------------------- |
| `.`              | `dist/index.js`, `dist/index.d.ts`   | 컴포넌트 진입점 (`"use client"`)        |
| `./styles.css`   | `dist/styles.css`                    | 토큰과 컴포넌트 스타일 (필수)           |
| `./tailwind.css` | `dist/tailwind.css`                  | Tailwind v4 `@theme inline` 매핑 (선택) |
| `./tokens`       | `dist/tokens.js`, `dist/tokens.d.ts` | 토큰 상수 `vars`, `values`              |

## `styles.css` 구조

```css
@layer theme, base, components, utilities;
@layer theme {
  :root {
    /* --tm-* 토큰 */
  }
}
@layer components {
  /* src/styles/index.css에서 불러온 컴포넌트 스타일 */
}
```

- 첫 구문은 항상 레이어 순서 선언입니다.
- 토큰은 `theme` 레이어, 컴포넌트 스타일은 `components` 레이어에 들어갑니다. 그래서 Tailwind 유틸리티(`utilities` 레이어)나 레이어 밖의 스타일로 덮어쓸 수 있습니다.
- 컴포넌트가 없는 지금은 `components` 레이어가 비어 있어 `@layer components;`만 출력됩니다.

## 개발

```sh
pnpm --filter @themoment-team/design-system-react build
pnpm --filter @themoment-team/design-system-react test
pnpm --filter @themoment-team/design-system-react typecheck
```

- 빌드와 타입 검사는 토큰 패키지의 `dist/`를 읽습니다. 저장소 루트의 `pnpm build`·`pnpm test`·`pnpm typecheck`는 Turborepo가 토큰 패키지를 먼저 빌드합니다. 이 패키지만 직접 실행한다면 토큰 패키지를 먼저 빌드합니다.
- 테스트는 `dist/`의 빌드 결과물을 검사하므로 빌드가 먼저 필요합니다. Turborepo로 실행하면 `turbo.json` 설정에 따라 빌드가 먼저 실행됩니다.
- `build`는 두 단계입니다.
  1. `tsdown`: `src/index.ts`, `src/tokens.ts`를 ESM과 타입 선언으로 묶습니다. `dist/`를 비우고 시작합니다.
  2. `scripts/build-css.mjs`: Lightning CSS로 `dist/styles.css`를 만들고, 토큰 패키지의 `theme.css`를 `dist/tailwind.css`로 복사합니다.
- 빌드 로그의 `MODULE_LEVEL_DIRECTIVE` 경고는 `src/index.ts`의 `"use client"`에 대한 것입니다. 진입 모듈의 지시문은 결과 파일 첫 줄에 유지되며, 테스트가 이를 확인합니다.

### 컴포넌트 스타일 추가

- 컴포넌트 CSS는 `src/styles/` 아래에 두고 `src/styles/index.css`에서 `@import`로 불러옵니다.
- 일반 CSS만 씁니다. Tailwind 문법(`@apply`, `@theme` 등)을 넣으면 테스트가 실패합니다.
- 레이어는 빌드가 감싸므로 파일 안에서 `@layer components`를 직접 쓰지 않습니다.
- `src/styles/**`에서는 `react`, `react-dom`을 가져올 수 없습니다(Oxlint 규칙).

### 배포 전 검사

`packages/react`에서 실행합니다.

```sh
npx publint
npx @arethetypeswrong/cli --pack .
```

`.attw.json`에 두 가지를 설정해 두었습니다.

- `profile: "esm-only"`: ESM 전용 패키지이므로 `node10`, `node16 (from CJS)` 해석 결과는 검사에서 제외합니다.
- `excludeEntrypoints`: `styles.css`, `tailwind.css`는 타입 선언이 없는 CSS 파일이라 검사 대상에서 뺍니다.
