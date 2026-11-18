# Storybook

새 Figma 디자인 시스템 확정 전의 문서·CSS 계약 검증 앱입니다. 컴포넌트는 없습니다.

## 실행

저장소 루트에서:

```sh
pnpm --filter storybook dev
pnpm build:storybook
pnpm --filter storybook exec playwright install chromium
pnpm test:storybook
pnpm --filter storybook typecheck
```

`build:storybook`, `test:storybook`은 Turbo로 실행해 의존 패키지(`packages/*`)를 먼저 빌드합니다.
`dev`는 단독 실행용이라 스크립트 안에서 패키지를 먼저 빌드합니다.
`pnpm --filter storybook build`/`test`를 직접 실행할 때는 `pnpm build`로 패키지를 먼저 빌드하세요.

- React 패키지는 `workspace:*` 의존성이며 소스 alias는 없습니다. 공개 export를 통해 `dist/`만 소비합니다.
- 토큰 문서는 `/tokens`의 `values`를 순회해 생성합니다. 확정 토큰으로 교체한 뒤 재빌드하면 경로·값·행 수가 바뀝니다.
- CSS fixture는 앱 안에만 있습니다. 패키지에 샘플 컴포넌트나 Tailwind 클래스를 추가하지 않습니다.
- 각 CSS 조합을 Vite + Tailwind v4로 별도 컴파일하고 `?inline`으로 읽어 독립 `iframe srcDoc`에 넣습니다. 전역 스타일이 섞여 import 순서 테스트가 거짓 양성이 되는 것을 방지합니다.
- `package-first.css`는 세 import의 순서까지 반대로 둡니다. 두 override story는 소비자의 레이어 없는 `:root` 선언이 이기는지 확인합니다.
- addon-vitest가 story의 `play`를 실제 Playwright Chromium에서 실행합니다. `getComputedStyle`로 일반 CSS 1개, Tailwind 순서 2개, override 순서 2개를 검증합니다.
- 기본 기대 색은 `values.color.brand.default`의 placeholder sRGB 원본에서 계산합니다. 미래 토큰이 sRGB가 아닌 색 공간으로 바뀌면 테스트의 색 정규화도 확장해야 합니다.

현재 값은 placeholder입니다. 실제 브랜드 값이나 UI 컴포넌트를 정의하지 않습니다.
