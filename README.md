# themoment Design System

Figma 변수를 바탕으로 만드는 디자인 시스템 모노레포입니다. Node.js 22 이상과 pnpm 12.18.0을 사용하고, Turborepo 2.11.11로 빌드·테스트·타입 검사 작업을 실행하고 캐시합니다.

## 구조

- `packages/tokens`: `@themoment-team/design-system-tokens` — 디자인 토큰
- `packages/react`: `@themoment-team/design-system-react` — React 컴포넌트와 CSS
- `apps/storybook`: 컴포넌트 문서와 브라우저 검증
- `examples`: 배포 패키지를 설치하는 독립 검증 예제 (워크스페이스 제외)
- `.changeset`: 두 공개 패키지를 같은 버전으로 관리하는 Changesets 설정
- `docs`: 설계 검토와 구현 계획

## 개발

```sh
pnpm install
pnpm lint
pnpm format:check
pnpm typecheck
```

`pnpm format`은 포맷을 적용합니다. 테스트와 빌드는 `pnpm test`, `pnpm build`로 실행하며, Storybook과 사용하는 쪽 검증은 각각 `pnpm test:storybook`, `pnpm test:consumers`로 분리합니다. 테스트·빌드 구현은 후속 작업에서 추가합니다.

현재 패키지는 빈 골격이며, 각 패키지의 TypeScript 설정은 소스 추가 전까지 빈 프로젝트로 둡니다. 소스를 추가할 때 `files`와 `references` 대신 `include`를 지정하고 타입 검사 스크립트를 확장합니다.

`packages/react/src/styles/**`에서는 React 런타임을 가져올 수 없습니다. 토큰과 React 패키지는 Changesets의 고정 그룹으로 함께 버전이 올라갑니다.
