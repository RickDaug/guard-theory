# Supplied artwork

`guard-theory-logo-source.png` is the logo as the owner supplied it: 1254×1254,
white on black, mark over wordmark over tagline.

It is committed because it is the origin of the identity, not because anything
builds from it directly. The build reads `src/lib/brand/logo.json`, which is the
traced vector version of this file.

**If this file changes, re-trace it:**

```
npm install potrace --no-save && node scripts/brand/trace.mjs
npm run brand:build
```

The first command rewrites `src/lib/brand/logo.json`; the second regenerates
every asset from it. potrace is deliberately not a dependency — it is needed only
when the artwork changes, and `logo.json` is committed so a normal install and a
normal build never ask for it.

The tracing parameters, and the measurements that justify them, are documented at
the top of `scripts/brand/trace.mjs`.
