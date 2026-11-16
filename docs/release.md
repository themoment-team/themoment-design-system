# 릴리스 운영

현재는 placeholder 토큰과 코드 인프라만 준비된 상태입니다. 이 문서와 워크플로 추가는 첫 배포 승인이 아닙니다. **첫 npm publish는 관리자의 명시적 승인이 필요하며, 실제 계정 권한·인증 수단과 배포 설정이 준비될 때까지 기다립니다.** 이 작업에서는 버전을 올리는 changeset 생성, version, publish, 원격 설정을 실행하지 않습니다.

## 버전 관리

- Changesets를 사용하며 두 공개 패키지 `@themoment-team/design-system-tokens`, `@themoment-team/design-system-react`는 `.changeset/config.json`의 fixed 그룹으로 관리합니다.
- 릴리스할 변경에는 작성자가 `pnpm changeset`으로 변경 설명과 patch / minor / major 수준을 기록합니다. 호환성 수정은 patch, 호환 기능 추가는 minor, 호환되지 않는 변경은 major로 검토합니다. 아직 확정되지 않은 디자인 값을 릴리스 가능한 디자인으로 설명하지 않습니다.
- 활성화 후 main push에서 Changesets action이 버전·CHANGELOG 갱신 PR을 생성하거나 갱신합니다. 관리자가 변경을 검토하고 병합하면 다음 main 실행에서 `pnpm build && pnpm changeset publish`로 미발행 버전을 게시합니다.
- `.github/workflows/ci.yml`은 PR과 main에서 frozen install, lint, format, typecheck, Chromium 설치, test, build, tarball 소비자 검증을 수행합니다. 루트 `pnpm test`에 Storybook 브라우저 검증이 포함되므로 `pnpm test:storybook`을 중복 실행하지 않습니다.

## 관리자 최초 설정

아래는 사람이 한 번 수행할 설정이며 이 저장소 변경으로 실행되지 않습니다.

1. npm 조직의 두 패키지 이름 소유권, public 배포 권한, 저장소 연결 메타데이터를 확인합니다. 아직 존재하지 않는 패키지는 trusted publisher 등록에 앞서 별도 승인된 최초 발행 절차가 필요할 수 있습니다. 이를 위해 임의 버전 증가나 자동 첫 발행을 하지 않습니다.
2. **각 패키지 모두** npm Settings의 Trusted Publisher에 GitHub Actions를 등록합니다. 실제 GitHub owner/repository, workflow filename `release.yml`, environment `npm-release`를 정확히 입력합니다. 한 패키지 설정이 다른 패키지에 전파되지 않습니다.
3. GitHub에 `npm-release` environment를 만들고 required reviewers와 main 배포 제한을 설정합니다. self-review 방지와 환경 보호 기능 사용 가능 여부도 확인합니다. 이 워크플로는 버전 PR 생성 단계부터 환경 승인을 기다립니다.
4. GitHub Actions의 PR 생성 권한을 허용하고 main의 필수 CI 검사·리뷰 규칙을 설정합니다. `GITHUB_TOKEN`이 만든 버전 PR은 다른 워크플로를 자동 트리거하지 않을 수 있으므로, 필수 검사가 실행되는 GitHub App 토큰 운영 또는 관리자 승인 재실행 절차를 준비합니다. 검사 없이 병합하지 않습니다.
5. OIDC 경로는 npm token을 저장하지 않습니다. 워크플로의 `id-token: write`, npm CLI `11.5.1`, `NPM_CONFIG_PROVENANCE=true`를 유지합니다. 실제 GitHub-hosted runner에서 인증·provenance 결과를 확인해야 하며 로컬 YAML 검증만으로 발행 성공을 주장하지 않습니다.
6. 첫 발행 승인과 실제 인증 준비가 끝난 뒤에만 repository variable `RELEASE_ENABLED`를 문자열 `true`로 설정합니다. 미설정 또는 다른 값이면 릴리스 job 전체가 건너뛰어집니다. 이후 main push로 실행되며 매 실행은 environment 승인을 거칩니다. 준비 전에는 비활성 상태를 유지합니다.

## NPM_TOKEN 대체 경로

Trusted publishing을 사용할 수 없을 때만 관리자가 별도로 승인한 최소 권한·짧은 만료의 granular npm token을 `npm-release` environment secret `NPM_TOKEN`에 보관합니다. 실제 토큰이 준비되기 전에는 예시 토큰으로 실행하지 않습니다.

이 대체 경로는 기본 워크플로에 켜져 있지 않습니다. 사용하려면 release workflow의 setup-node에 `registry-url: https://registry.npmjs.org`를 추가하고 Changesets step의 env에 `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`를 추가합니다. npmrc가 이 환경 변수를 참조하도록 setup-node가 설정합니다. provenance 설정과 승인 게이트는 유지합니다. OIDC로 복귀하면 토큰 주입과 registry-url 설정을 제거하고 대체 토큰을 폐기합니다. 토큰 값은 파일·PR·로그에 쓰지 않습니다.

## Storybook Vercel 연결

관리자가 GitHub 저장소를 Vercel에 연결하고 다음 값을 설정합니다. 이 작업은 프로젝트 생성·연결·배포를 수행하지 않습니다.

- Root Directory: `apps/storybook`
- Framework Preset: Other
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm --dir ../.. build:storybook` (Turbo가 의존 패키지를 먼저 빌드)
- Output Directory: `storybook-static` (프로젝트 root 기준)
- Node 버전: 루트 `.nvmrc`와 일치하는 22.x
- 프로젝트 root 외부 workspace 소스를 빌드에 포함하도록 설정하고, Git 연결의 PR Preview Deployment를 활성화합니다. main은 Production Branch로 지정합니다.

첫 preview에서 모노레포 lockfile 인식, 공개 패키지 빌드, 토큰 문서와 CSS 계약 fixture 접근을 확인합니다. 공개 preview에는 비밀을 넣지 않습니다. npm 발행과 Storybook preview는 별도 승인·운영 대상입니다.

## 실패 대응

빌드·인증·provenance 실패 시 환경 승인을 중단하고 `RELEASE_ENABLED`를 비활성화합니다. 이미 게시한 npm 버전은 같은 번호로 덮어쓸 수 없으므로 원인 수정 후 새 changeset으로 복구 버전을 검토합니다. 일부 패키지만 게시된 경우 실제 registry 상태와 두 패키지 의존 버전을 먼저 확인하며, 무조건 재발행하거나 unpublish하지 않습니다.
