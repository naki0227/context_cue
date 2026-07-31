# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog, and release versions follow Semantic
Versioning while the project is pre-1.0.

## [Unreleased]

## [0.1.5] - 2026-07-31

### Added

- Device-aware local STT model selection with a high-accuracy
  `large-v3-turbo-q5_0` option for supported hardware
- A privacy-preserving install page that narrows downloads by operating system
- Stable installer asset names and SHA-256 checksums for every desktop platform

### Changed

- Verify both lightweight and high-accuracy Whisper models with official
  SHA-256 digests and exact file sizes
- Sync only audited release-repository files with a neutral public identity
  before building a tagged Release
- Use one README action for both first-time installation and updates

## [0.1.4] - 2026-07-30

### Fixed

- Added ad-hoc signing for macOS builds without an Apple certificate so
  downloaded Apple Silicon bundles are not treated as damaged

The `v0.1.3` macOS arm64 artifact failed the first installation smoke test
with a damaged-app warning and was not promoted.

## [0.1.3] - 2026-07-30

### Fixed

- Passed the isolated release repository and release token as explicit inputs
  when uploading CLI archives and checksums

## [0.1.2] - 2026-07-30

### Fixed

- Compiled native Linux C and C++ dependencies as position-independent code
  for Tauri packaging

This draft attempt built all Tauri and CLI targets and passed every CLI CRUD
smoke test, but CLI asset upload used the source repository context and was
denied before promotion.

## [0.1.1] - 2026-07-29

### Added

- Privacy audit and release metadata preflight checks
- Release quality gate and packaged CLI artifacts with SHA-256 checksums
- Privacy notice, consent guidance, and release checklist

### Changed

- Replaced person-like demo records with role-based fictional labels
- Replaced deliverable-looking demo addresses with reserved `.invalid` domains
- Adopted a non-personal application bundle identifier before public release
- Updated GitHub Actions to Node 24-based major versions
- Repaired Linux audio headers, unsigned macOS packaging, and Windows audio
  dependency compatibility for the cross-platform draft release

This draft attempt produced Windows and macOS artifacts but was not promoted
because Linux packaging failed before the CLI release jobs could run.

## [0.1.0] - 2026-07-29

Failed draft release attempt. This version was not promoted because the
cross-platform packaging jobs did not complete.
