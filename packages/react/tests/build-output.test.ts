import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as tokens from '@themoment-team/design-system-tokens';
import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';

// 공개 경로(package.json의 exports)가 가리키는 빌드 결과물을 검사합니다. 먼저 build가 필요합니다.
const fromRoot = (path: string) => resolve(import.meta.dirname, '..', path);
const read = (path: string) => readFileSync(fromRoot(path), 'utf8');
const readTokensFile = (name: string) =>
  readFileSync(
    createRequire(import.meta.url).resolve(`@themoment-team/design-system-tokens/${name}`),
    'utf8',
  );
const tokenNames = (css: string) =>
  [...css.matchAll(/(--tm-[\w-]+)\s*:/g)].map((match) => match[1]).sort();

describe('styles.css', () => {
  const styles = read(packageJson.exports['./styles.css']);

  it('첫 구문이 레이어 순서 선언이다', () => {
    expect(styles).toMatch(/^@layer theme,\s*base,\s*components,\s*utilities;/);
  });

  it('토큰은 모두 theme 레이어 안에만 선언된다', () => {
    const themeLayer = styles.match(/@layer theme\s*\{\s*:root\s*\{[^}]*\}\s*\}/)?.[0] ?? '';
    const expected = tokenNames(readTokensFile('tokens.css'));
    expect(expected.length).toBeGreaterThan(0);
    expect(tokenNames(themeLayer)).toEqual(expected);
    expect(tokenNames(styles.replace(themeLayer, ''))).toEqual([]);
  });

  it('Tailwind at-rule이 없다', () => {
    expect(styles).not.toMatch(
      /@(tailwind|theme|apply|utility|variant|custom-variant|source|plugin|config|reference)\b/,
    );
  });
});

describe('tailwind.css', () => {
  it('토큰 패키지의 @theme 매핑과 같다', () => {
    const tailwind = read(packageJson.exports['./tailwind.css']);
    expect(tailwind).toMatch(/@theme inline\s*\{/);
    expect(tailwind).toBe(readTokensFile('theme.css'));
  });
});

describe('JS 진입점', () => {
  it('패키지 진입점만 "use client"로 시작한다', () => {
    expect(read(packageJson.exports['.'].import)).toMatch(/^"use client";/);
    expect(read(packageJson.exports['./tokens'].import)).not.toMatch(/use client/);
  });

  it('/tokens가 토큰 패키지의 vars·values를 내보낸다', async () => {
    const entry = pathToFileURL(fromRoot(packageJson.exports['./tokens'].import)).href;
    const reexported = await import(/* @vite-ignore */ entry);
    expect(Object.keys(reexported.vars).length).toBeGreaterThan(0);
    expect(reexported.vars).toEqual(tokens.vars);
    expect(reexported.values).toEqual(tokens.values);
  });
});
