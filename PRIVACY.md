# Privacy Notice

Last updated: 2026-07-28

## Scope

How to Talk is a local-first conversation support application. This notice
describes the default application behavior. It does not cover operating system
services, Ollama, model download hosts, or software a user independently adds.

## Data processed

The application can process:

- participant and project notes entered by the user
- imported Markdown or text documents
- microphone audio while a consented session is active
- locally generated transcripts, summaries, and cue suggestions
- application settings and consent audit metadata

Do not enter passwords, API keys, private keys, government identifiers, or
unnecessary third-party personal data.

## Storage defaults

- Raw audio is not saved.
- Transcript storage is off by default.
- Summary storage is off by default.
- AI output storage is off by default.
- Knowledge is stored only after an explicit user action.
- Consent audit records contain a session ID, confirmation time, and policy
  version, but not conversation content.

Workspace data is stored in the operating system's application-data directory.
The workspace uses owner-only file permissions where the operating system
supports them, bounded backups, schema validation, and atomic replacement.

## Network behavior

Core conversation processing is local. The application communicates with a
locally configured Ollama service for local model inference. Network access may
occur when the user explicitly downloads an Ollama or speech-recognition model,
or follows an external documentation link.

The application does not enable analytics or telemetry by default.

## User controls

Users can:

- choose which transcript, summary, and AI fields are retained
- export the workspace as JSON
- delete the workspace, backups, and temporary persistence files
- stop a session and discard non-retained in-memory conversation data
- enable Share Safe Mode to cover overlay content during screen sharing

Share Safe Mode does not replace participant consent and cannot guarantee that
another application or operating-system capture tool will hide content.

## Retention and deletion

Saved data remains until the user edits or deletes it. Backup generations are
bounded by the application. A full deletion removes application-managed
workspace, backup, and temporary files, but cannot remove copies the user
exported or copied elsewhere.

## Security reports and privacy questions

Do not post sensitive data in a public issue. Use the repository host's private
security advisory feature to contact the maintainers.

## Changes

Material changes to data collection, storage defaults, or network behavior must
update this notice, the product SPEC, and related tests in the same release.
