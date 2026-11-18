# 구현 계획 — 마일스톤 1: 기반 + 첫 컴포넌트

- 상태: **승인됨 (2026-11-16)** — `asChild`는 Base UI `useRender`, Node 22 LTS 이상
- 작성일: 2026-11-16
- 근거 문서: Notion "themoment Design System 개발 계획", [Figma 검토 문서](./figma-review.md)

## 범위 변경 (2026-11-16)

기존 Figma 파일(`nKZ0QCNMIEGDMyPR4GjRR5`)은 파기되었고, 디자이너가 디자인 시스템을 처음부터 다시 만들고 있습니다.

- **보류:** Figma를 근거로 하는 작업 전부. 실제 토큰 값, Button을 포함한 모든 컴포넌트는 새 디자인 시스템이 나온 뒤 진행합니다.
- **마일스톤 1의 새 범위:** 디자인 값 없이 코드로 해결할 수 있는 인프라만 만듭니다.
  - placeholder 토큰으로 동작하는 토큰 파이프라인
  - React 패키지 빌드
  - Storybook
  - 사용하는 쪽 검증 예제
  - CI
- placeholder 토큰은 작은 DTCG JSON(예: `color/brand/default`, `color/text/primary`, `color/surface/default`, `radius/md`, `spacing/4`, `font-size/body`)으로 두고 placeholder임을 명시합니다. 새 디자인 시스템의 내보내기 결과로 그대로 교체합니다.
- 작업별 상태:
  - **T1 완료.** 계획에 없던 Turborepo를 추가했습니다(루트 `build`·`test`·`typecheck`가 `turbo run`을 호출).
  - **T2:** placeholder 토큰 파이프라인으로 바꿉니다. Figma 추출은 하지 않습니다.
  - **T3:** 그대로 진행합니다. `components` 레이어는 비어 있습니다.
  - **T4:** 보류(새 디자인 시스템 이후).
  - **T5·T6·T7:** Button에 의존하지 않게 바꿉니다. 각 작업의 "범위 변경 후" 항목을 따릅니다.
- 아래 본문은 원래 승인된 계획을 기록으로 남겨 둔 것입니다. 이 절과 충돌하면 이 절을 따릅니다.

## 목표

**요청:** 디자인 시스템 패키지 개발을 시작합니다.

**요청 너머의 목표:** 팀 프로젝트가 `@themoment-team/design-system-react` 하나만 설치하고 `styles.css`만 불러오면, Tailwind를 쓰든 쓰지 않든 추가 설정 없이 Figma와 같은 UI를 쓸 수 있어야 합니다.

마일스톤 1은 컴포넌트 수를 늘리는 단계가 아닙니다. 이 경로 전체를 **Button 하나로 처음부터 끝까지 검증**하는 단계입니다.
- 경로: Figma 변수 → 토큰 → CSS → 컴포넌트 → Storybook → npm 배포 → 실제 사용하는 프로젝트
- 이 경로가 검증되면 이후 컴포넌트는 같은 틀에 내용만 채우면 됩니다.

## 범위

**포함**
- pnpm 모노레포 골격
- 도구: tsdown, Oxlint, Oxfmt, Vitest, Changesets
- `@themoment-team/design-system-tokens`: Figma 변수 → `tokens.css`, `theme.css`, `index.ts`
- `@themoment-team/design-system-react`: 빌드 파이프라인과 Button
- `apps/storybook`: Vercel 배포, 토큰 문서, Button 스토리
- 사용하는 쪽 검증 예제: Tailwind 프로젝트, Tailwind가 없는 프로젝트, Next.js App Router
- CI, 그리고 0.x 버전 배포 흐름

**제외 (마일스톤 2 이후)**
- Button 외 컴포넌트
- 다크 모드
- Ark UI, Vue 지원
- 시각적 회귀 테스트 서비스(Chromatic 등)
- CSS 린트(Stylelint)
- Figma 검토 문서의 P1 결과 반영. 디자이너 확인이 끝나면 토큰 이름이나 값 변경 작업을 별도로 진행합니다.

## 전제

- 토큰 값은 현재 Figma 변수를 정답으로 봅니다(Figma 검토 문서 P1이 확인되기 전까지).
- 최신 버전 확인(2026-11-16, npm 기준):

  | 패키지 | 버전 |
  | --- | --- |
  | `@base-ui/react` | 1.9.0 (`@base-ui-components/react`에서 이름이 바뀜) |
  | tsdown | 0.23.7 |
  | oxlint | 1.93.0 |
  | oxfmt | 0.78.0 |
  | storybook | 10.6.7 |
  | vitest | 5.1.0 |
  | style-dictionary | 5.8.0 |
  | @changesets/cli | 3.0.3 |
  | tailwindcss | 4.3.5 |

- 원재료는 Figma 파일 `nKZ0QCNMIEGDMyPR4GjRR5`의 변수와 텍스트 스타일입니다.
  - Figma Dev Mode MCP(`get_variable_defs`, `get_metadata`)로 다시 추출해서 저장소에 원본 JSON으로 커밋합니다.
  - 이전 조사 때 뽑은 데이터는 임시 폴더에 있어 정리되었으므로 다시 추출해야 합니다.

## 승인 전에 정할 것

1. **`asChild` 구현 방법**
   - 추천: Base UI의 `useRender`로 내부에서 구현하고, 공개 API에는 `asChild`만 노출합니다.
   - 대안: `@radix-ui/react-slot`. 구현은 간단하지만 Radix 의존성이 하나 늘어납니다.
2. **Node.js 버전**
   - 추천: Node 22 LTS 이상. `engines` 필드와 `.nvmrc`에 고정합니다.

## 작업

각 작업은 PR 하나를 기본 단위로 합니다.

### T1. 저장소 골격 (사전 정비)

- 의존: 없음
- 작성 파일:
  - 루트: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.nvmrc`, `.gitignore`
  - 린트·포맷 설정: `.oxlintrc.json`, `.oxfmtrc.json`
  - 테스트·버전 설정: `vitest.config.ts`, `.changeset/config.json`
- 작업 내용:
  - 패키지 폴더 2개와 앱 폴더 1개를 빈 상태로 만듭니다.
  - Changesets는 `fixed`로 두 패키지를 묶습니다.
  - Oxlint에 `no-restricted-imports` 규칙을 설정합니다. `src/styles/**`에서는 `react`를 import할 수 없습니다.
- 완료 확인:
  - `pnpm install && pnpm lint && pnpm format:check && pnpm typecheck`가 모두 통과합니다.
  - 일부러 `src/styles/` 아래에 `import 'react'`를 넣으면 `pnpm lint`가 실패합니다. (2026-11-16 확인) 깨끗한 클론에서 임시 파일로 Oxlint `no-restricted-imports`가 실패하는 것을 확인했습니다. 지금은 `src/styles/`에 TS 파일이 없어 평소에는 걸릴 대상이 없으며, 컴포넌트를 추가할 때 다시 확인합니다.

### T2. 토큰 패키지 → placeholder 토큰 파이프라인

- **범위 변경 후:** Figma 추출 대신 placeholder DTCG JSON을 원본으로 씁니다. 출력(`tokens.css`, `theme.css`, `index.ts`)과 테스트(이름 중복 없음, `vars`·`values` 일치, Tailwind 컴파일 시 `.bg-brand-default` 생성)는 그대로 유지하고, 개수 비교 기준은 placeholder JSON입니다.
- 의존: T1
- 작성 파일: `packages/tokens/**`
- 작업 내용:
  - Figma MCP로 변수 72개와 텍스트 스타일 14개를 추출해 `packages/tokens/src/figma-variables.json`(원본)으로 저장합니다.
  - 이를 DTCG JSON(`tokens/*.json`)으로 변환합니다.
  - Style Dictionary로 아래 세 파일을 만듭니다.
    - `tokens.css`: `:root`의 `--tm-*`
    - `theme.css`: `@theme inline` 매핑
    - `index.ts`: `vars`, `values`
- 완료 확인: `pnpm --filter @themoment-team/design-system-tokens test`가 통과합니다. 테스트는 다음을 검사합니다.
  - 원본 JSON의 모든 변수가 `tokens.css`에 하나씩 있습니다(개수 일치, 이름 중복 없음).
  - `vars.color.brand.default === 'var(--tm-color-brand-default)'`
  - `values`의 hex 값이 원본과 같습니다.
  - `theme.css`를 Tailwind v4 CLI로 컴파일하면 `.bg-brand-default`가 생성됩니다.

### T3. React 패키지 빌드 파이프라인 (사전 정비)

- 의존: T2
- 작성 파일: `packages/react/{package.json,tsdown.config.ts,scripts/build-css.*,src/index.ts,src/tokens.ts,src/styles/index.css}`
- 작업 내용:
  - `exports`를 정의합니다: `.`, `./styles.css`, `./tailwind.css`, `./tokens`
  - `styles.css` 빌드 순서:
    1. 레이어 순서 선언(`@layer theme, base, components, utilities;`)
    2. `theme` 레이어 안에 토큰
    3. `components` 레이어 안에 컴포넌트 CSS
    - Lightning CSS로 묶고 최소화합니다.
  - tsdown 빌드 결과물에 `"use client"` 지시문을 유지합니다.
  - 의존성:
    - `dependencies`: tokens, `@base-ui/react`
    - `peerDependencies`: `react`, `react-dom`, `tailwindcss`(optional)
- 완료 확인:
  - `pnpm --filter @themoment-team/design-system-react build`가 성공합니다.
  - `npx publint`와 `npx @arethetypeswrong/cli --pack`에 오류가 없습니다.
  - `dist` 진입 파일의 첫 줄이 `"use client"`입니다(grep).

### T4. Button (첫 번째 수직 슬라이스) — 보류

- **범위 변경 후:** 새 디자인 시스템이 나올 때까지 보류합니다. 아래 내용은 기록용입니다.
- 의존: T3
- 작성 파일: `packages/react/src/components/button/**`, `packages/react/src/styles/button.css`, `packages/react/src/index.ts`
- 작업 내용:
  - Figma의 Button 96개 variant(Size × Color × Variant × State)를 구현합니다.
  - 공개 API: `size`, `color`, `variant`, `asChild`, `disabled`, `className`
  - variant는 `data-*` 속성으로 내보내고, 스타일은 `.tm-button[data-*]` 선택자로 작성합니다.
- 완료 확인: `pnpm --filter @themoment-team/design-system-react test`가 통과합니다. 테스트는 다음을 검사합니다.
  - 기본값이 `data-size="m"`, `data-color="primary"`, `data-variant="fill"`로 렌더링됩니다.
  - `asChild`로 `<a>`를 넘기면 `<a class="tm-button ...">`가 렌더링됩니다.
  - `disabled`이면 클릭 핸들러가 호출되지 않습니다.
  - `className`이 기존 클래스에 합쳐집니다.
  - axe 접근성 검사에서 위반이 0건입니다.

### T5. Storybook

- **범위 변경 후:** 의존은 T3입니다. Button 스토리 대신 placeholder 토큰 문서 페이지와 `styles.css`·`tailwind.css` 동작을 보여 주는 예시 스토리(평범한 요소에 `--tm-*` 적용)를 만듭니다. 브라우저 테스트도 이 요소로 검사합니다: 토큰 값 적용, Tailwind 유틸리티 덮어쓰기와 import 순서 무관, `:root` 재정의 반영.
- 의존: T4
- 작성 파일: `apps/storybook/**`
- 작업 내용:
  - 워크스페이스 의존성으로 빌드된 `dist`를 가져와 실제 사용자와 같은 방식으로 import합니다.
  - 토큰 문서 페이지(색상, 타이포, 간격, radius)를 만듭니다.
  - Button 스토리에 Figma 전체 variant를 격자로 보여 줍니다.
  - 브라우저 테스트(Storybook Vitest 애드온, Playwright)를 추가합니다.
- 완료 확인:
  - `pnpm --filter storybook build`가 성공합니다.
  - `pnpm --filter storybook test`가 통과합니다. 브라우저에서 계산된 스타일로 다음을 검사합니다.
    - 기본 Button의 배경이 `rgb(74, 128, 248)`입니다.
    - Tailwind 스토리에서 `className="bg-red-500"`가 배경을 덮어씁니다.
    - Tailwind import 순서를 바꾼 스토리에서도 결과가 같습니다.
    - `:root { --tm-color-brand-default: … }`로 재정의한 값이 반영됩니다.

### T6. 사용하는 쪽 검증 예제

- **범위 변경 후:** 의존은 T3입니다. Button 대신 `styles.css` import, `/tokens`의 `vars`·`values` 사용, 패키지 진입점 import(Next.js 서버 컴포넌트 포함)를 검증합니다.
- 의존: T5
- 작성 파일: `examples/{vite-tailwind,vite-styled-components,next-app-router}/**`, `scripts/test-consumers.*`
- 작업 내용:
  - `pnpm pack`으로 만든 tarball만 설치합니다. 워크스페이스 링크는 쓰지 않습니다.
  - 예제마다 README의 import 방법 그대로 Button을 렌더링합니다.
- 완료 확인: `pnpm test:consumers`가 세 예제 모두 빌드 성공으로 끝납니다. 이 테스트는 다음을 검사합니다.
  - 예제는 `design-system-react` 하나만 의존합니다.
  - `@themoment-team/design-system-react/tokens` import가 pnpm strict 모드에서 해결됩니다.
  - Next.js 서버 컴포넌트 페이지에서 Button import 시 빌드 오류가 없습니다.

### T7. CI와 배포 흐름

- **범위 변경 후:** CI 워크플로는 Button 없이 T1–T3·T5·T6 결과만 검사합니다. 실제 npm 배포, Vercel 프로젝트 연결은 사용자 확인 전까지 하지 않습니다.
- 의존: T6
- 작성 파일: `.github/workflows/{ci,release}.yml`, `vercel.json` 또는 Vercel 프로젝트 설정 문서
- 작업 내용:
  - CI: lint, format check, typecheck, test, build, Storybook test, 사용하는 쪽 검증을 PR마다 실행합니다.
  - 배포: Changesets 배포 PR 방식으로 npm에 0.x를 배포합니다. npm trusted publishing을 우선 사용하고, 안 되면 `NPM_TOKEN`을 씁니다.
  - Storybook: Vercel에 배포하고 PR마다 미리보기를 만듭니다.
- 완료 확인:
  - 테스트 PR에서 CI가 모두 통과합니다.
  - Vercel 미리보기 URL이 PR에 표시됩니다.
  - `0.1.0`을 실제로 배포한 뒤 `npm view @themoment-team/design-system-react version`으로 확인합니다.
  - npm 배포는 되돌리기 어려운 작업이라 실행 전에 사용자 확인을 받습니다.

### T8. 최종 검증 (closing gate)

- 의존: T1–T7
- 작업 내용:
  - 깨끗한 클론에서 `pnpm install && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build && pnpm --filter storybook test && pnpm test:consumers`를 실행해 모두 통과하는지 확인합니다.
  - 만든 사람이 아닌 사람(사수 또는 팀원)이 PR을 리뷰합니다.
- 리뷰에서 문제가 나오면:
  - 수정 작업(T9…)을 별도 id와 완료 확인으로 추가하고, 이 검증을 다시 실행합니다.
  - 수정은 최대 2회까지 하고, 그래도 남은 문제는 목록으로 보고합니다.

## 검토 포인트 (테스트로 덮어야 하는 위험)

1. **Next.js 서버 컴포넌트에서 import했을 때 `"use client"`가 빠져 빌드가 실패하는 경우**
   - 담당: T3(grep 확인), T6(Next 예제)
2. **Tailwind import 순서에 따라 덮어쓰기 결과가 달라지는 경우**
   - 기대: 순서와 관계없이 유틸리티가 이깁니다.
   - 담당: T5
3. **pnpm strict 모드에서 `/tokens` 하위 경로가 해결되지 않는 경우**
   - 담당: T6
4. **Figma 변수 이름 변환에서 생기는 충돌**
   - Figma 이름 예: `Brand/Primary-Strong`, `Grey/50`, `Radius/full`, 컬렉션 이름 `2. Semantic`
   - 이런 이름을 CSS 변수 이름으로 바꿀 때 서로 다른 변수가 같은 이름이 되거나 이름 규칙이 깨질 수 있습니다.
   - 기대: 변수가 하나도 빠지거나 겹치지 않습니다.
   - 담당: T2
5. **사용하는 쪽의 `:root` 재정의가 import 순서와 관계없이 적용되는지**
   - 담당: T5

## 위험

- **oxfmt가 0.x이고 tsdown도 0.x**
  - 위험: 버전이 올라가면서 포맷 결과나 설정 방식이 바뀔 수 있습니다.
  - 대응: 버전을 고정하고(`exact`), Renovate 같은 도구로 PR 단위로 올립니다.
- **Figma P1 결과에 따른 토큰 이름 변경**
  - 위험: 디자이너 확인 결과 토큰 이름이 바뀌면 코드도 바꿔야 합니다.
  - 대응: 컴포넌트는 Semantic 토큰만 참조하게 해서 영향 범위를 줄입니다. 0.x 기간에 반영합니다.
- **우선 적용 프로젝트가 없음**
  - 위험: API 검증이 늦어집니다.
  - 대응: T6 예제와 Storybook 실사용 예시로 보완합니다.

## 마일스톤 2 이후 (참고)

컴포넌트 하나를 T4·T5와 같은 수직 슬라이스로 진행합니다. 컴포넌트, CSS, 스토리, 단위 테스트, 브라우저 테스트, changeset을 함께 만듭니다.

순서:
1. Text Field, Text Form Template
2. Checkbox
3. Dialog
4. Drop Down / Select 계열
5. Terms of Service(Collapsible)
6. Search Action

4~6번은 Figma 확인 결과를 받은 뒤 진행합니다.

## 다음 단계

계획이 승인되면 T1부터 브랜치와 PR로 진행합니다. 작업 사이에 순서가 정해져 있어서(T1→T7) 병렬로 나눌 부분은 적습니다. 그래서 한 사람이 순서대로 PR을 쌓는 방식이 맞다고 봅니다.
