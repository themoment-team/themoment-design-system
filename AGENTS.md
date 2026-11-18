# AGENTS.md

이 파일은 이 저장소에서 작업하는 코딩 에이전트(Codex, Claude Code, Hermes 등)를 위한 안내입니다. 코드만 읽어서는 알 수 없는 명령, 생성 파일, 검사, 겪었던 함정, 팀 규칙을 적습니다. 사람용 소개는 `README.md`, 각 패키지 사용법은 패키지별 README를 보세요.

<!-- omh:agent-instructions:begin -->

## 빌드와 테스트

환경: Node.js 22 이상(`.nvmrc`), pnpm은 루트 `package.json`의 `packageManager`에 고정된 버전. 모든 명령은 저장소 루트에서 실행합니다.

| 명령                                 | 하는 일                                                                                                        | 상태                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `pnpm install --frozen-lockfile`     | 의존성 설치(lockfile 변경 금지)                                                                                | verified (exit 0, 2026-11-18)        |
| `pnpm lint`                          | Oxlint                                                                                                         | verified (exit 0, 2026-11-18)        |
| `pnpm format:check`                  | Oxfmt 검사 (`pnpm format`으로 적용)                                                                            | verified (exit 0, 2026-11-18)        |
| `pnpm typecheck`                     | Turbo로 패키지별 타입 검사                                                                                     | verified (exit 0, 2026-11-18)        |
| `pnpm test`                          | Turbo로 tokens·react 단위 테스트 (Storybook 제외)                                                              | verified (exit 0, 2026-11-18)        |
| `pnpm build`                         | `packages/*` 빌드                                                                                              | verified (exit 0, 2026-11-18)        |
| `pnpm lint:packages`                 | 두 패키지에 publint + attw (빌드 후 실행)                                                                      | verified (exit 0, 2026-11-18)        |
| `pnpm build:storybook`               | Storybook 정적 빌드                                                                                            | verified (exit 0, 2026-11-18)        |
| `pnpm test:storybook`                | Storybook Chromium 브라우저 테스트. 처음 한 번 `pnpm --filter storybook exec playwright install chromium` 필요 | verified (exit 0, 2026-11-18)        |
| `pnpm test:consumers`                | 두 패키지를 tarball로 묶어 저장소 밖 임시 폴더에서 `examples/*`를 설치·빌드                                    | verified (exit 0, 2026-11-18, macOS) |
| `actionlint .github/workflows/*.yml` | 워크플로 검사 (로컬에 actionlint 필요)                                                                         | verified (exit 0, 2026-11-18)        |

- 변경을 마치기 전에 위 명령을 모두 돌립니다. CI(`.github/workflows/ci.yml`)도 같은 명령을 실행합니다.
- Turbo 캐시가 실패를 가릴 수 있으니 검증할 때는 `TURBO_FORCE=true`를 붙입니다.
- `pnpm --filter <패키지> test`처럼 패키지에서 직접 실행하면 Turbo의 선행 `build`가 돌지 않습니다. `pnpm build`를 먼저 실행하세요.
- `pnpm test:consumers`는 macOS·Linux 전용입니다(Windows 미지원).

## 생성 파일

아래 파일은 직접 고치지 않습니다. 원본을 고치고 다시 생성합니다.

| 생성 파일                                                                                | 원본                                                                           | 다시 생성                                                  | 검사                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `packages/tokens/dist/*` (`tokens.css`, `theme.css`, `index.js`, `index.d.ts`)           | `packages/tokens/tokens/*.json` (DTCG), `packages/tokens/scripts/build.mjs`    | `pnpm --filter @themoment-team/design-system-tokens build` | `pnpm test`, `pnpm lint:packages`                          |
| `packages/react/dist/*` (`index.js`, `tokens.js`, `styles.css`, `tailwind.css`, `.d.ts`) | `packages/react/src/**`, `packages/react/scripts/build-css.mjs`, tokens `dist` | `pnpm build`                                               | `pnpm test`(빌드 결과물 계약 테스트), `pnpm lint:packages` |
| `apps/storybook/storybook-static/`                                                       | `apps/storybook/src/**`, 빌드된 패키지                                         | `pnpm build:storybook`                                     | `pnpm test:storybook`                                      |
| `pnpm-lock.yaml`                                                                         | 각 `package.json`, `pnpm-workspace.yaml`                                       | `pnpm install`                                             | `pnpm install --frozen-lockfile`                           |

`dist/`, `storybook-static/`, `next-env.d.ts`는 gitignore 대상이라 커밋하지 않습니다.

## 검사 기준

- `pnpm format:check`는 Oxfmt 출력과 바이트 단위로 같아야 통과합니다. `docs/**`와 `pnpm-lock.yaml`은 Oxfmt 대상이 아닙니다.
- `pnpm install --frozen-lockfile`은 lockfile이 `package.json`과 정확히 맞아야 통과합니다. 의존성을 바꾸면 `pnpm install`로 lockfile을 갱신해 같이 커밋합니다.
- React 빌드 결과물 테스트(`packages/react/tests/build-output.test.ts`)는 CSS 배포 계약을 검사합니다: `styles.css` 첫 문장이 레이어 순서 선언, 토큰은 theme 레이어, Tailwind 문법 없음, 진입점만 `"use client"`로 시작.
- Oxlint는 `packages/react/src/styles/**`에서 `react` import를 금지합니다.

## 함정 (겪은 문제)

- **새 의존성을 추가한 뒤 CI 설치가 실패함**: pnpm 12는 빌드 스크립트가 있는 새 의존성이 생기면 `pnpm install --frozen-lockfile`을 `ERR_PNPM_IGNORED_BUILDS`로 실패시킵니다. 일반 `pnpm install`은 통과해서 로컬에서는 놓치기 쉽습니다(`@parcel/watcher`, `esbuild`에서 두 번 겪음). 의존성을 추가하면 반드시 frozen install을 다시 돌리고, 미리 빌드된 바이너리로 동작하는 패키지는 `pnpm-workspace.yaml`의 `allowBuilds`에 `false`로 등록합니다.
- **`pnpm test`가 가끔 실패함**: 패키지의 `test`·`typecheck` 스크립트 안에서 빌드를 다시 돌리면, 토큰 빌드가 `dist`를 지우는 동안 React 빌드가 그 파일을 읽어 경쟁 상태가 됩니다. 선행 빌드는 패키지 `turbo.json`의 `dependsOn: ["build"]`로만 선언합니다.
- **Tailwind 클래스가 생성되지 않음**: 유틸리티 이름은 토큰 경로에서 나옵니다. `color.text.primary`는 `text-text-primary`이지 `text-primary`가 아닙니다(예제에서 텍스트 색이 적용되지 않는 버그를 리뷰에서 발견).
- **릴리스 워크플로의 발행 명령이 실행되지 않음**: `changesets/action`의 `publish-script`는 셸을 거치지 않아 `a && b`의 `&& b`가 인자로 넘어갑니다. 빌드는 별도 step으로 둡니다.
- **푸시했는데 PR CI가 돌지 않음**: 새 head 커밋에 대한 실행이 생기지 않는 경우가 있었습니다. `gh run list --branch <브랜치> -L 1 --json headSha`로 확인하고, 없으면 PR을 닫았다 다시 열어 `pull_request: reopened`로 실행합니다(CI에 `workflow_dispatch` 없음).
- **빌드 경고 두 개는 정상입니다**: tsdown의 `tsgo ... deprecated`(TypeScript 7.1 정식판이 나오면 tsdown과 함께 올립니다. tsdown만 다음 마이너로 올리면 `.d.ts` 생성이 깨질 수 있음)와 진입점 `'use client'`에 대한 `MODULE_LEVEL_DIRECTIVE`(지시문은 실제로 유지되며 테스트가 보장).
- **빌드 방식을 바꿨는데 배포 문서가 그대로임**: 스크립트나 Turbo 의존을 바꾸면 `docs/release.md`의 Vercel 빌드 명령과 각 README의 명령도 찾아 고칩니다. 오래된 배포 명령은 조용히 깨집니다.

## 팀 규칙

- **디자인 값**: 기존 Figma는 파기되었고 디자이너가 새로 만드는 중입니다. 새 Figma가 나오기 전까지 실제 토큰 값이나 컴포넌트를 추가하지 않고, `packages/tokens/tokens/`의 placeholder만 씁니다.
- **CSS 배포 계약**: 사용하는 쪽은 `@themoment-team/design-system-react` 하나만 설치합니다. `styles.css`는 필수(레이어 순서 선언 + `--tm-*` 토큰 + 컴포넌트 CSS, Tailwind 문법 없음), `tailwind.css`는 선택(`@theme inline` 매핑만), 토큰 상수는 `/tokens` 하위 경로입니다. 패키지 내부 스타일은 일반 CSS로 작성합니다.
- **의존성**: 버전을 정확히 고정합니다(`pnpm-workspace.yaml`의 `saveExact`). 쓰기 권한을 쓰는 서드파티 GitHub 액션은 커밋 SHA로 고정합니다.
- **커밋**: 작은 논리 단위로 나누고, 각 커밋이 lint·format을 통과하게 합니다. 메시지는 `type: 한국어 설명`(예: `fix: Tailwind 테마 변수 이름 충돌 시 빌드 실패`).
- **브랜치**: main에 직접 푸시하지 않고 브랜치와 PR로 진행합니다.
- **배포**: npm 발행, Vercel 연결, 릴리스 활성화(`RELEASE_ENABLED`)는 메인테이너의 명시적 승인 없이 하지 않습니다. 절차는 `docs/release.md`에 있습니다.
- **언어**: 문서와 커밋 메시지는 한국어로 씁니다.

<!-- omh:agent-instructions:end -->
