import { defineConfig } from 'tsdown';

export default defineConfig({
  // `"use client"`는 src/index.ts 맨 위에만 둡니다. Rolldown은 진입 모듈의 지시문을 결과 파일
  // 첫 줄에 유지하며, 빌드 때 나오는 MODULE_LEVEL_DIRECTIVE 경고는 이 지시문에 대한 것입니다.
  // tokens 진입점은 서버 컴포넌트에서도 쓰므로 지시문을 넣지 않습니다.
  entry: ['src/index.ts', 'src/tokens.ts'],
  format: 'esm',
  // 브라우저와 서버 양쪽에서 쓰는 패키지입니다. 결과 파일 확장자는 .js / .d.ts입니다.
  platform: 'neutral',
  dts: true,
  // dependencies와 peerDependencies는 tsdown이 기본으로 번들에서 제외합니다.
});
