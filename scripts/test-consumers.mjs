import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const reactPackage = '@themoment-team/design-system-react';
const tokensPackage = '@themoment-team/design-system-tokens';
const examples = ['vite-tailwind', 'vite-styled-components', 'next-app-router'];

function run(args, cwd = root, config = {}) {
  console.log(`\n[consumers] ${args.join(' ')} (${cwd})`);
  const result = spawnSync('pnpm', args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ...config },
  });
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    `pnpm ${args.join(' ')} failed (${result.signal ?? result.status})`,
  );
}

const temporary = await mkdtemp(join(process.env.TMPDIR || tmpdir(), 'tm-ds-consumers-'));
try {
  // relative()는 Windows에서 드라이브가 다르면 절대 경로를 돌려주므로 접두사로 판단합니다.
  const repository = resolve(root);
  const target = resolve(temporary);
  assert(
    target !== repository && !target.startsWith(repository + sep),
    'Consumers must be outside the repo',
  );
  console.log(`[consumers] Isolated directory: ${temporary}`);
  run(['build']);

  const tarballs = {};
  for (const name of ['tokens', 'react']) {
    const destination = join(temporary, `pack-${name}`);
    run(['pack', '--pack-destination', destination], join(root, 'packages', name));
    const packed = (await readdir(destination)).filter((file) => file.endsWith('.tgz'));
    assert.equal(packed.length, 1, `Expected one ${name} tarball`);
    tarballs[name] = join(destination, packed[0]);
  }

  for (const name of examples) {
    const destination = join(temporary, name);
    await cp(join(root, 'examples', name), destination, {
      recursive: true,
      filter: (source) =>
        !['node_modules', 'dist', '.next', 'pnpm-lock.yaml'].includes(basename(source)),
    });
    const manifestPath = join(destination, 'package.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    for (const section of [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ]) {
      assert(!manifest[section]?.[tokensPackage], `${name} must not depend directly on tokens`);
    }
    assert(manifest.dependencies?.[reactPackage], `${name} must install the React package`);
    manifest.dependencies[reactPackage] = `file:${tarballs.react}`;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    // --ignore-workspace also skips pnpm-workspace.yaml settings. Pass the
    // unpublished transitive dependency override through pnpm's config env.
    const config = {
      PNPM_CONFIG_OVERRIDES: JSON.stringify({ [tokensPackage]: `file:${tarballs.tokens}` }),
      PNPM_CONFIG_ALLOW_BUILDS: JSON.stringify({ esbuild: true }),
    };
    run(['install', '--ignore-workspace', '--no-frozen-lockfile'], destination, config);
    run(['run', 'build'], destination, config);
    if (name === 'vite-tailwind') {
      const assets = join(destination, 'dist', 'assets');
      const styles = await Promise.all(
        (await readdir(assets))
          .filter((file) => file.endsWith('.css'))
          .map((file) => readFile(join(assets, file), 'utf8')),
      );
      assert(
        styles.some((css) =>
          /\.bg-brand-default\s*\{[^}]*var\(--tm-color-brand-default\)/.test(css),
        ),
        'Tailwind must generate bg-brand-default using the design-system variable',
      );
    }
    console.log(`[consumers] PASS ${name}`);
  }
  console.log(`[consumers] All ${examples.length} tarball consumer builds passed.`);
} catch (error) {
  console.error('[consumers] FAIL', error);
  process.exitCode = 1;
} finally {
  await rm(resolve(temporary), { recursive: true, force: true });
}
