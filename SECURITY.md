# Security Policy

## Reporting a vulnerability

Do not open a public issue for a vulnerability, private data exposure, or a
report containing conversation content.

Use the repository host's private Security Advisory feature. Include:

- affected version and operating system
- minimal reproduction steps using synthetic data
- potential impact
- any suggested mitigation

Remove API keys, tokens, real transcripts, imported documents, names, and
contact details before submitting a report.

## Supported versions

No production version is currently supported. Version `0.1.x` is a private
preview until the required release checklist is complete.

## Security architecture

How to Talk is local-first:

- raw audio is not persisted
- transcript, summary, and AI-output storage are off by default
- workspace writes use schema validation, size limits, bounded backups, and
  atomic replacement
- workspace files use owner-only permissions where supported
- the main and overlay windows have separate Tauri capabilities
- the WebView uses a restrictive Content Security Policy
- local inference is accessed through the local Ollama endpoint

The application does not claim to protect data from an administrator account,
malware, operating-system capture tools, unencrypted device backups, or copies
exported by the user. Device encryption and an up-to-date operating system are
recommended.

## Secret and privacy controls

The repository CI checks tracked and candidate files for representative secret
formats, non-reserved email addresses, user-specific absolute paths, phone and
postal formats, and sensitive filenames.

This automated audit does not reliably identify every natural-language name,
image metadata field, or secret format. Release review must also inspect:

- Git author metadata and repository remote identity
- image and document metadata
- generated bundles and debug symbols
- logs, diagnostics, screenshots, and release notes

## Release requirements

Broad distribution is blocked until:

- macOS signing and notarization are verified
- Windows code signing is verified
- application and CLI artifacts pass supported-OS smoke tests
- SHA-256 checksums and SBOMs are attached
- Privacy Notice and consent guidance match runtime behavior
- export, deletion, recovery, and save-off behavior are tested

See `docs/release-checklist.md` for the full gate.
