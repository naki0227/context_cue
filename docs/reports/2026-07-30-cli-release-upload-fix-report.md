# 作業報告書

## 作業日時

2026年07月30日 17時01分36秒

## 作業対象

`v0.1.2` CLI Release upload失敗の調査と公開先入力の修正。

## 作業目的

4ターゲットのCLI archiveとchecksumを、開発元ではなく隔離された公開
リポジトリのdraft Releaseへ添付する。

## 変更内容

- Release run `30523846887`を完了まで確認した
- Tauri 4環境、CLI build/CRUD smoke/package 4環境の成功を確認した
- `softprops/action-gh-release`へ`repository`と`token`を明示入力した
- 公開先入力の回帰テストを追加し、versionを`0.1.3`へ統一した

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
- `docs/reports/2026-07-30-cli-release-upload-fix-report.md`

## 変更意図

環境変数による公開先overrideがActionで利用されず、開発元Repositoryへの
Release作成として権限拒否されたため、公式の`repository`入力を使用する。

## 設計上の意図

Release tokenの権限範囲と同じ公開リポジトリをAction入力へ明示し、一方向の
公開境界を曖昧にしない。秘密値は取得・表示・保存しない。

## 影響範囲

CLI archive/checksumのupload先だけに影響する。build成果物、アプリ、API、
DB、workspace schema、ユーザーデータには影響しない。

## 追加・更新したテスト

CLI upload stepが`RELEASE_REPOSITORY_TOKEN`と`enludus/How-to-talk`を明示入力
することを検証するNode testを追加した。Node 18件とRust 45件が成功し、
Whisper実機test 1件は既定どおり手動対象としてignoreされた。

## 実行した確認コマンド

- `node scripts/release-preflight.mjs --tag v0.1.3`
- `node scripts/privacy-audit.mjs`
- `node scripts/release-repository-audit.mjs`
- `node --test scripts/*.test.mjs`
- `cargo fmt --all -- --check`
- `cargo check --workspace --locked`
- `cargo test --workspace --locked`
- `git diff --check`

すべて成功した。frontend全検証、Rust clippy/build/auditはcommit後の通常CIと
Release quality gateで再確認する。

## CIで確認される内容

version/tag整合性、privacy・公開分離・依存監査、format、lint、typecheck、
Node/Rust test、frontend/Rust build、Tauri/CLI packaging、CLI CRUD smoke、
公開側draftへの成果物uploadを確認する。

## 未解決の課題

- macOS公証とWindowsコード署名は未設定
- 公開draft成果物のmetadata監査と実インストールsmokeは未実施

## 次にやること

`enludus`で公開側draftの成果物名、checksum、metadataを確認し、各OSで
インストールsmoke testを行う。

## 次回最初に見るべきファイル

- `.github/workflows/release.yml`
- `scripts/release-workflow.test.mjs`
- `docs/release-checklist.md`
- `docs/TODO.md`

## 引き継ぎ事項

`v0.1.0`から`v0.1.2`のタグは失敗履歴として移動しない。公開側draftを維持し、
署名未設定の成果物をproduction releaseとして公開しない。

## 実行結果

2026年07月30日、通常CI run `30525108567`とRelease run `30525579050`が成功した。
Releaseではquality gate、Tauri 4環境、CLI 4環境のbuild、隔離CRUD smoke、
archive/checksum作成、公開側draftへのuploadがすべて成功した。

確認できたTauri workflow artifactsは次の9種類。

- `windows-x64-nsis`
- `windows-x64-msi`
- `linux-amd64-appimage`
- `linux-x86_64-rpm`
- `linux-amd64-deb`
- `darwin-x64-app`
- `darwin-x64-dmg`
- `darwin-aarch64-app`
- `darwin-aarch64-dmg`

Releaseはdraftのまま維持されており、production公開は行っていない。
