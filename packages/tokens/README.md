# @themoment-team/design-system-tokens

> **현재 `tokens/`의 모든 값은 placeholder입니다.** 빌드·소비 경로를 검증하기 위한 중립적인 임시 값이며 실제 브랜드/디자인 명세가 아닙니다. Figma 데이터는 사용하지 않습니다.

## 소스와 빌드

DTCG JSON(`$type`, `$value`)을 `tokens/**/*.json`에 둡니다. 색상은 `colorSpace`/`components`/`alpha`, 길이는 `value`/`unit` 객체를 사용합니다. Style Dictionary v5가 CSS 값으로 변환합니다.

```sh
pnpm --filter @themoment-team/design-system-tokens build
pnpm --filter @themoment-team/design-system-tokens test
pnpm --filter @themoment-team/design-system-tokens typecheck
```

생성된 `dist/`는 커밋하지 않고 패키지 배포 파일에만 포함합니다.

| 산출물            | 계약                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `dist/tokens.css` | 레이어 없는 `:root`의 `--tm-*` 선언                                 |
| `dist/theme.css`  | Tailwind v4 전용 `@theme inline` 매핑; 토큰 값 선언은 포함하지 않음 |
| `dist/index.js`   | 중첩 객체 `vars`(CSS 참조 문자열), `values`(변환 전 DTCG `$value`)  |
| `dist/index.d.ts` | 같은 중첩 구조와 리터럴 값의 타입 선언                              |

`values`의 색상과 dimension은 CSS 문자열이 아니라 원본 DTCG 객체입니다. 별칭도 원본 참조 문자열을 유지하며 CSS 산출물은 Style Dictionary가 해석합니다.

## 결정적 이름 규칙

토큰의 **경로 세그먼트를 각각 소문자로 바꾼 뒤 `-`로 연결하고 `--tm-`을 앞에 붙입니다.** camelCase 분할이나 공백 치환 같은 추가 정규화는 하지 않습니다.

- `color.brand.default` → `--tm-color-brand-default`
- `radius.md` → `--tm-radius-md`
- `spacing.4` → `--tm-spacing-4`
- `font-size.body` → `--tm-font-size-body`

빌드는 CSS 식별자로 표현할 수 없는 이름과 서로 다른 경로의 CSS 이름 충돌을 오류로 처리합니다. 경로 세그먼트는 영문·숫자·밑줄·하이픈으로 작성합니다. JS 객체 키는 원본 경로를 유지하므로 하이픈/숫자가 있는 키는 `vars['font-size'].body`, `vars.spacing['4']`처럼 접근합니다.

## 사용

토큰만 사용하는 앱은 다음을 가져옵니다.

```ts
import '@themoment-team/design-system-tokens/tokens.css';
import { vars, values } from '@themoment-team/design-system-tokens';

const backgroundColor = vars.color.brand.default; // var(--tm-color-brand-default)
const sourceColor = values.color.brand.default; // DTCG 색상 객체
```

Tailwind v4에서는 토큰 선언과 선택적 테마 매핑을 함께 가져옵니다.

```css
@import 'tailwindcss';
@import '@themoment-team/design-system-tokens/tokens.css';
@import '@themoment-team/design-system-tokens/theme.css';
```

`color.*` → `--color-*`, `radius.*` → `--radius-*`, `spacing.*` → `--spacing-*`, `font-size.*` → `--text-*`로 매핑합니다. 예를 들어 `--color-brand-default: var(--tm-color-brand-default)`가 `bg-brand-default`를 만듭니다. `--radius-md`, `--spacing-4`도 반드시 별도 `--tm-*` 변수를 참조하므로 자기 참조가 생기지 않습니다. 새 최상위 범주는 CSS/JS에는 포함되지만 Tailwind 매핑은 `scripts/build.mjs`의 `namespaces`에 명시적으로 추가해야 합니다.

React 패키지 사용자는 그 패키지의 `styles.css`를 기본 진입점으로 사용합니다. 토큰 전용의 레이어 없는 CSS와 React 패키지의 레이어된 토큰 CSS를 중복으로 가져올 필요는 없습니다.

## 디자이너의 확정 export로 교체

1. 디자이너가 확정한 DTCG JSON export를 받습니다. 확정 전에는 현재 값에서 실제 디자인을 추정하지 않습니다.
2. `tokens/placeholder.tokens.json`을 제거하고 export JSON을 `tokens/`에 넣습니다. 기존 placeholder와 함께 두어 같은 경로가 중복 정의되지 않게 합니다. `$description` 등 DTCG 메타데이터는 토큰 이름에 포함되지 않습니다.
3. 기존 경로를 유지하면 CSS 변수/JS 접근 경로도 유지됩니다. 경로 변경은 소비자 API 변경으로 검토하고, 새 Tailwind 범주가 있으면 매핑도 함께 추가합니다.
4. 위 build/test/typecheck 명령을 실행하고 생성 CSS와 원본 `values`를 검토합니다. 현재 리터럴 타입 smoke test(`tests/types.ts`)는 placeholder 값에 고정되어 있으므로 확정 export의 값·경로에 맞게 갱신합니다.

테스트는 소스 토큰별 CSS 선언의 정확한 일대일 대응, 이름 충돌 여부, JS 원본 값과 참조 문자열을 검사합니다. 실제 Tailwind v4 CLI로 HTML의 `bg-brand-default`, `rounded-md`, `p-4`, `text-body`가 올바른 `--tm-*` 참조로 컴파일되는지도 검증합니다.
