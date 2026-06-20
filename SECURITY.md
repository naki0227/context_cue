# Security Policy

Please do not open public issues for sensitive security findings.

Report vulnerabilities privately to the maintainers with:

- affected version
- reproduction steps
- potential impact
- any suggested mitigation

## Local-first security assumptions

How to Talk is designed as a local-first desktop application.

- profile notes and imported knowledge are stored on the local device
- overlay preferences and dashboard drafts are stored locally
- the default mock session flow does not upload transcripts to a remote service
- participant consent is required before a session can be started

## Stored data

Current implementation stores the following on the local machine:

- imported profile documents
- Share Safe Mode state
- overlay settings
- dashboard draft items created from the UI

Current implementation does not persist full transcript history by default.

## Recommended production hardening

Before broad distribution, maintainers should additionally verify:

- macOS notarization and signing
- Windows code signing
- release artifact checksums
- clear privacy notice for imported personal data
- documented retention policy for any future transcript persistence
