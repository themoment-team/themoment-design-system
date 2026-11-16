import StyleDictionary from 'style-dictionary';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));

StyleDictionary.registerTransform({
  name: 'name/tm-path',
  type: 'name',
  transform: (token) => `tm-${token.path.map((segment) => segment.toLowerCase()).join('-')}`,
});

const dictionary = new StyleDictionary({
  source: ['tokens/**/*.json'],
  usesDtcg: true,
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['name/tm-path'],
      buildPath: 'dist/',
      files: [
        { destination: 'tokens.css', format: 'css/variables', options: { showFileHeader: false } },
      ],
    },
  },
});
const { allTokens } = await dictionary.getPlatformTokens('css');
const names = new Set();
for (const token of allTokens) {
  if (names.has(token.name)) throw new Error(`CSS 토큰 이름 충돌: --${token.name}`);
  if (!/^tm-[a-z0-9_-]+$/.test(token.name)) {
    throw new Error(`CSS 이름으로 표현할 수 없는 토큰 경로: ${token.path.join('.')}`);
  }
  names.add(token.name);
}
await dictionary.buildAllPlatforms();

const vars = Object.create(null);
const values = Object.create(null);
function setPath(target, path, value) {
  const parent = path.slice(0, -1).reduce((node, segment) => {
    node[segment] ??= Object.create(null);
    return node[segment];
  }, target);
  parent[path.at(-1)] = value;
}
const namespaces = { color: 'color', radius: 'radius', spacing: 'spacing', 'font-size': 'text' };
const mappings = [];
for (const token of allTokens) {
  setPath(vars, token.path, `var(--${token.name})`);
  setPath(values, token.path, token.original.$value);
  const [category, ...segments] = token.path;
  const namespace = namespaces[category];
  if (namespace) {
    const name = [namespace, ...segments].map((segment) => segment.toLowerCase()).join('-');
    mappings.push(`  --${name}: var(--${token.name});`);
  }
}
const json = (value) => JSON.stringify(value, null, 2);
await Promise.all([
  writeFile('dist/theme.css', `@theme inline {\n${mappings.join('\n')}\n}\n`),
  writeFile(
    'dist/index.js',
    `export const vars = ${json(vars)};\nexport const values = ${json(values)};\n`,
  ),
  writeFile(
    'dist/index.d.ts',
    `export declare const vars: ${json(vars)};\nexport declare const values: ${json(values)};\n`,
  ),
]);
