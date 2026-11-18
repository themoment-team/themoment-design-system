import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceTokens = [];
function collect(node, path = []) {
  if ('$value' in node) {
    sourceTokens.push({ path, value: node.$value });
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('$')) collect(value, [...path, key]);
  }
}
for (const file of readdirSync(`${root}tokens`, { recursive: true }).sort()) {
  if (file.endsWith('.json')) collect(JSON.parse(readFileSync(`${root}tokens/${file}`, 'utf8')));
}
const cssName = (path) => `--tm-${path.map((segment) => segment.toLowerCase()).join('-')}`;

test('모든 원본 토큰이 충돌 없이 CSS에 정확히 한 번 선언된다', () => {
  const css = readFileSync(`${root}dist/tokens.css`, 'utf8');
  const names = sourceTokens.map(({ path }) => cssName(path));
  assert.ok(names.length > 0);
  assert.equal(new Set(names).size, names.length);
  const declarations = [...css.matchAll(/(--tm-[\w-]+)\s*:/g)].map((match) => match[1]);
  assert.deepEqual(declarations.toSorted(), names.toSorted());
  assert.match(css, /:root\s*\{/);
  assert.doesNotMatch(css, /@layer/);
});

test('vars는 CSS 참조이며 values는 변환 전 DTCG 원본 값이다', async () => {
  const { vars, values } = await import('../dist/index.js');
  assert.equal(vars.color.brand.default, 'var(--tm-color-brand-default)');
  const atPath = (object, path) => path.reduce((node, key) => node[key], object);
  const expectedValues = {};
  for (const { path, value } of sourceTokens) {
    assert.equal(atPath(vars, path), `var(${cssName(path)})`);
    const parent = path
      .slice(0, -1)
      .reduce((node, segment) => (node[segment] ??= {}), expectedValues);
    parent[path.at(-1)] = value;
  }
  assert.deepEqual(values, expectedValues);
  const countLeaves = (object) =>
    Object.values(object).reduce(
      (count, value) => count + (typeof value === 'string' ? 1 : countLeaves(value)),
      0,
    );
  assert.equal(countLeaves(vars), sourceTokens.length);
});

test('Tailwind v4 CLI가 theme.css로 bg-brand-default를 생성한다', () => {
  const directory = mkdtempSync(join(tmpdir(), 'tm-tokens-'));
  try {
    const html = join(directory, 'index.html');
    const input = join(directory, 'input.css');
    const output = join(directory, 'output.css');
    symlinkSync(`${root}node_modules`, join(directory, 'node_modules'), 'junction');
    writeFileSync(html, '<div class="bg-brand-default rounded-md p-4 text-body"></div>');
    writeFileSync(
      input,
      '@import "tailwindcss";\n' + `@import "${root}dist/theme.css";\n@source "${html}";\n`,
    );
    execFileSync('pnpm', ['exec', 'tailwindcss', '-i', input, '-o', output], {
      cwd: root,
      stdio: 'pipe',
    });
    const css = readFileSync(output, 'utf8');
    assert.match(
      css,
      /\.bg-brand-default\s*\{\s*background-color:\s*var\(--tm-color-brand-default\)/,
    );
    assert.match(css, /\.rounded-md\s*\{\s*border-radius:\s*var\(--tm-radius-md\)/);
    assert.match(css, /\.p-4\s*\{\s*padding:\s*var\(--tm-spacing-4\)/);
    assert.match(css, /\.text-body\s*\{\s*font-size:\s*var\(--tm-font-size-body\)/);
    const theme = readFileSync(`${root}dist/theme.css`, 'utf8');
    assert.match(theme, /@theme inline/);
    for (const match of theme.matchAll(/(--[\w-]+):\s*var\((--[\w-]+)\)/g)) {
      assert.notEqual(match[1], match[2]);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
