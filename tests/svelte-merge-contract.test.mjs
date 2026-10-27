import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
const pluginEntry = import.meta.resolve('@sveltejs/vite-plugin-svelte');
const pluginRequire = createRequire(pluginEntry);
const dependency = pluginRequire('deepmerge');
const optionsUrl = new URL('./utils/options.js', pluginEntry);
const { preResolveOptions } = await import(optionsUrl.href);
const merge = dependency({ symbols: true, mergeArray: () => (_target, source) => source });
const env = { command: 'build', mode: 'production' };
const actual = (options) => preResolveOptions({ configFile: false, ...options }, { root: process.cwd() }, env);

test('installed plugin uses declared pinned maintained replacement with no old deepmerge lock entry', async () => {
  const packagePath = join(dirname(pluginRequire.resolve('deepmerge')), 'package.json');
  const pkg = JSON.parse(await readFile(packagePath, 'utf8'));
  assert.equal(pkg.name, '@fastify/deepmerge'); assert.equal(pkg.version, '3.2.4');
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.pnpm.overrides['@sveltejs/vite-plugin-svelte@7.3.1>deepmerge'], 'npm:@fastify/deepmerge@3.2.4');
  const lock = await readFile(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8');
  assert(!/^  deepmerge@/m.test(lock));
});
test('real plugin preserves nested compiler settings, false and source array replacement', async () => {
  const extensions = ['.svelte', '.component']; const input = { extensions, emitCss: false, compilerOptions: { dev: false, css: 'external' } };
  const result = await actual(input);
  assert.deepEqual(result.extensions, extensions); assert.equal(result.emitCss, false);
  assert.deepEqual(result.compilerOptions, input.compilerOptions);
  assert.equal(result.isBuild, true); assert.equal(result.root, process.cwd());
  assert.deepEqual(merge({ a: { b: [1], c: true } }, { a: { b: [2], d: false } }), { a: { b: [2], c: true, d: false } });
});
test('real plugin retains callback, regexp, date and enumerable symbol options without mutating input', async () => {
  const callback = () => {}; const pattern = /component/u; const date = new Date('2026-01-01'); const symbol = Symbol('qa-setting');
  const input = { onwarn: callback, include: pattern, compilerOptions: { value: date, [symbol]: 'kept' } };
  const result = await actual(input);
  assert.equal(result.onwarn, callback); assert.equal(result.include, pattern); assert.equal(result.compilerOptions.value, date); assert.equal(result.compilerOptions[symbol], 'kept');
  assert.equal(input.compilerOptions[symbol], 'kept');
});
test('null/primitive target and target-copy prototype poisoning payloads do not acquire inherited privileges', () => {
  const payload = JSON.parse('{"session":{"__proto__":{"qaInheritedAdmin":true}}}');
  for (const target of [{ session: null }, { session: 0 }, Object.create(null), JSON.parse('{"__proto__":{"qaInheritedAdmin":true}}')]) {
    const result = merge(target, payload);
    assert.equal(result.qaInheritedAdmin, undefined); assert.equal(result.session.qaInheritedAdmin, undefined);
    assert.equal(Object.prototype.qaInheritedAdmin, undefined);
  }
});
test('constructor/prototype keys are rejected while ordinary nested data and symbols survive', () => {
  const payload = JSON.parse('{"constructor":{"prototype":{"qaInheritedAdmin":true}},"prototype":{"qaInheritedAdmin":true},"ok":{"value":42}}');
  const result = merge({}, payload);
  assert(!Object.hasOwn(result, 'constructor')); assert(!Object.hasOwn(result, 'prototype'));
  assert.deepEqual(result.ok, { value: 42 }); assert.equal(Object.prototype.qaInheritedAdmin, undefined);
});
test('real config-file to inline resolution rejects the demonstrated nested null-target poisoning', async () => {
  const root = await mkdtemp(join(tmpdir(), 'cocoding-svelte-config-'));
  try {
    const configFile = join(root, 'svelte.config.mjs');
    await writeFile(configFile, "export default { extensions: ['.old'], compilerOptions: { qaSession: null, retained: true } };\n");
    const compilerOptions = JSON.parse('{"qaSession":{"__proto__":{"qaInheritedAdmin":true}},"normal":42}');
    const result = await preResolveOptions({ configFile, extensions: ['.svelte'], compilerOptions }, { root }, env);
    assert.equal(result.compilerOptions.qaSession.qaInheritedAdmin, undefined);
    assert.equal(result.compilerOptions.retained, true); assert.equal(result.compilerOptions.normal, 42);
    assert.deepEqual(result.extensions, ['.svelte']); assert.equal(Object.prototype.qaInheritedAdmin, undefined);
  } finally { await rm(root, { recursive: true, force: true }); }
});
