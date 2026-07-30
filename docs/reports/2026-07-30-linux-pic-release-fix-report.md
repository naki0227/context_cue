# 作業報告書

## 作業日時

2026年07月30日 16時35分15秒

## 作業対象

`v0.1.1` Release失敗の調査とLinux Tauri packaging修正。

## 作業目的

LinuxのWhisperネイティブ依存を安全にリンクし、4環境のTauri成果物とCLIを
隔離された公開リポジトリへdraft Releaseできる状態にする。

## 変更内容

- Release run `30462941632`の失敗ログを調査した
- LinuxのC/C++ compile flagsへ`-fPIC`を追加した
- PIC設定のworkflow回帰テストを追加した
- 製品versionを`0.1.2`へ統一し、失敗した`v0.1.1`をCHANGELOGへ記録した

## 変更したファイル

- `.github/workflows/release.yml`
- `scripts/release-workflow.test.mjs`
- `Cargo.toml`
- `Cargo.lock`
- `package.json`
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/tauri.conf.json`
- `CHANGELOG.md`
- `docs/TODO.md`
- `docs/reports/2026-07-30-linux-pic-release-fix-report.md`

## 変更意図

Ubuntu Tauri buildの`rust-lld`が`whisper-rs-sys`内のC/C++ objectに対して
`recompile with -fPIC`を要求したため、Linuxだけにposition-independent
code生成を指定した。

## 設計上の意図

ネイティブ依存のbuild境界だけで修正し、Rust実装、公開分離、署名設定、
依存versionを変更しない。macOSとWindowsの成功済み経路にも影響させない。

## 影響範囲

Linux runnerでbuildされるTauriとCLIのネイティブC/C++ objectに限定される。
API、DB、workspace schema、ユーザーデータには影響しない。

## 追加・更新したテスト

Release workflowにLinux PIC flagsが2つのpackaging jobで設定されることを
検証するNode testを追加した。Node 17件、frontend 43件、Rust 45件が成功し、
Whisper実機test 1件は既定どおり手動対象としてignoreされた。

## 実行した確認コマンド

- `node scripts/release-preflight.mjs --tag v0.1.2`
- `node scripts/privacy-audit.mjs`
- `node scripts/release-repository-audit.mjs`
- `node scripts/generate-spec.mjs --check`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo check --workspace --locked`
- `cargo test --workspace --locked`
- `cargo build --workspace --locked`
- `cargo audit`

すべて成功した。`cargo audit`は脆弱性0件、許可済み警告17件だった。

## CIで確認される内容

version/tag整合性、privacy・公開分離・依存監査、format、lint、typecheck、
Node/Rust test、frontend/Rust build、4環境のTauri/CLI packaging、CLI CRUD
smokeを確認する。Linux runnerが今回のPIC linkを実地検証する。

## 未解決の課題

- `v0.1.2`のUbuntu runnerでPIC修正を実地確認する必要がある
- macOS公証とWindowsコード署名は未設定
- 公開draft成果物のmetadata監査と実インストールsmokeは未実施
- RustSecの許可済み警告17件はTauri更新時に再評価が必要

## 次にやること

修正commitの通常CI成功後に`v0.1.2`タグをpushし、Release Actionsと公開側
draft成果物を確認する。

## 次回最初に見るべきファイル

- `.github/workflows/release.yml`
- `scripts/release-workflow.test.mjs`
- `docs/release-checklist.md`
- `docs/TODO.md`

## 引き継ぎ事項

`v0.1.0`と`v0.1.1`タグは失敗履歴として移動しない。公開側のdraftを維持し、
署名未設定の成果物をproduction releaseとして公開しない。
