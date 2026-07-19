# Vendored Meta Business SDK

`facebook-nodejs-business-sdk-25.0.3.tgz` is the prebuilt package used by
this repository for Meta Business SDK v25.0.3.

## Provenance

- Official release: <https://github.com/facebook/facebook-nodejs-business-sdk/releases/tag/v25.0.3>
- Official source commit: `584ba8d7414574744abe2f3bf0f2390937c916d5`
- Archive SHA-256: `88fac8a67e6e78a3715909fa2fd27ccb30da48550530ec6af920d510cc983aac`
- Package version: `25.0.3`

The archive's `src/`, `LICENSE`, and `README.md` were compared byte-for-byte
with the official source commit. The archive also contains the generated
`dist/cjs.js` and source map required by the package's declared CommonJS
entrypoint.

## Why the archive is checked in

Meta released v25.0.3 on GitHub before publishing it to npm. Installing the
raw Git source requires its legacy nested build toolchain during every clean
install. The prebuilt archive keeps local, CI, and Vercel installs frozen and
reproducible without allowing dependency build scripts at install time.

Do not replace the archive without updating the source commit, checksum,
lockfile integrity, runtime import smoke test, and Meta mapping tests.
