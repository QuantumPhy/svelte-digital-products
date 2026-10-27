# Svelte build dependency repair

The exact-parent override replaces the Svelte plugin7.3.1 dependency named
`deepmerge` with the integrity-locked `@fastify/deepmerge`3.2.4 package.
A declared pnpm patch adapts the plugin to its factory API and retains the
plugin's existing source-array replacement and enumerable-symbol behavior.
All other plugin/library source and upstream notices remain unchanged.

The original4.3.1 package reproduces returned-object prototype poisoning in
GHSA-gcqx-w48m-w2h4; the advisory was reviewed on27 October2026 and no original
patched release exists at this revision. This is build dependency coverage;
it is not evidence of an exploited deployed browser application. No scan or
advisory exception is used. Current lock audits must still complete normally.

The build runs real installed-plugin/config-file and merge regressions before
compilation, including nested null-target/constructor/prototype payloads,
arrays, callbacks, dates, regexps and symbols. Keep this declared adapter until
a compatible upstream plugin removes or fixes its affected dependency, then
remove the override and patch together and rerun the same checks.

Sources: https://github.com/advisories/GHSA-gcqx-w48m-w2h4
https://github.com/TehShrike/deepmerge/issues/273
https://github.com/fastify/deepmerge
