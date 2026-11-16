import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { bundle, transform } from 'lightningcss';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));

const readTokensFile = (name) =>
  readFile(
    fileURLToPath(import.meta.resolve(`@themoment-team/design-system-tokens/${name}`)),
    'utf8',
  );
const [tokens, theme] = await Promise.all([
  readTokensFile('tokens.css'),
  readTokensFile('theme.css'),
]);
const components = bundle({ filename: 'src/styles/index.css' }).code;

// Lightning CSS는 레이어 순서 선언을 뒤따르는 `@layer theme` 블록과 합쳐 위치를 바꾸므로,
// 순서 선언은 최소화가 끝난 본문 앞에 그대로 붙입니다.
const layerOrder = '@layer theme,base,components,utilities;';
const layers = transform({
  filename: 'styles.css',
  code: Buffer.from(`@layer theme {\n${tokens}}\n@layer components {\n${components}}\n`),
  minify: true,
}).code;

await mkdir('dist', { recursive: true });
await Promise.all([
  writeFile('dist/styles.css', `${layerOrder}${layers}\n`),
  writeFile('dist/tailwind.css', theme),
]);
