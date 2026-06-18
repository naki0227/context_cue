# How to Talk

How to Talk is the current product-facing name for **Context Cue**.

It is a local-first assistive overlay for consent-based conversations. The app helps users recall relevant notes, prior decisions, and personal context during meetings, interviews, mentoring, and 1on1s where all participants have agreed to transcription and AI assistance.

The project is not designed for covert recording, hidden transcription, or answer outsourcing.

## Status

This repository currently contains a Phase 0 MVP scaffold:

- Tauri v2 desktop app skeleton
- React + TypeScript frontend
- Rust backend state and command layer
- Mock transcript pipeline
- Adaptive inference concept with question detection
- Sample profile loading and keyword search

## Quick Start

1. Install `pnpm` via Corepack: `corepack enable && corepack prepare pnpm@10.15.1 --activate`
2. Install frontend dependencies: `pnpm install`
3. Run frontend tests: `pnpm test`
4. Run Rust tests: `cargo test`
5. Start the desktop app: `pnpm tauri:dev`

## Naming

- Repository / technical codename: `context-cue`
- Current display name: `How to Talk`

This split keeps package identifiers stable while the public-facing name is still easy to change.

## Docs

- [Requirements](./docs/requirements.md)
- [Architecture](./docs/architecture.md)
- [Implementation Plan](./docs/implementation-plan.md)

