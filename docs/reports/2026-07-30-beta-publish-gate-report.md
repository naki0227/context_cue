# 作業報告書

## 作業日時

2026年07月30日 18時48分27秒

## 作業対象

未署名ベータ版のGitHub Release公開ゲート。

## 作業目的

公開側アカウントを開発端末へログインさせず、元リポジトリのActionsから
実機確認後のDraftだけを安全にPre-release公開できるようにする。

## 変更内容

- 手動実行専用の`Publish Beta Release` workflowを追加した
- tag形式、実機確認、確認文の完全一致を公開条件にした
- Draft、Pre-release、ベータ注意文、3 OS成果物、4 checksumを自動検査する
- 条件通過後だけDraftをPre-releaseとして公開し、公開状態を再検証する
- 公開運用、チェックリスト、ADR、Todoを更新した

## 変更したファイル

- `.github/workflows/publish-beta-release.yml`
- `scripts/release-workflow.test.mjs`
- `docs/release.md`
- `docs/release-checklist.md`
- `docs/adr/0006-separate-draft-build-and-beta-publish.md`
- `docs/TODO.md`
- `docs/reports/2026-07-30-beta-publish-gate-report.md`

## 変更意図

Draft build成功と一般公開を同じイベントにせず、誤公開とローカル認証情報の
保存を避けるため。

## 設計上の意図

ビルドworkflowは常にDraftを維持し、公開workflowは人の明示確認と機械検査に
責務を限定する。公開先への権限は既存Repository Secretだけで使用する。

## 影響範囲

GitHub ActionsのRelease公開操作のみ。アプリ、保存データ、API、DBへの影響はない。

## 追加・更新したテスト

公開workflowが手動実行限定で、実機確認、確認文、Draft状態、ベータ指定、
OS別成果物、checksum、公開先Secretを要求する静的テストを追加した。

## 実行した確認コマンド

- `corepack pnpm audit --audit-level high`: 成功、既知脆弱性0件
- `corepack pnpm audit:privacy`: 成功
- `corepack pnpm audit:release-repository`: 成功
- `corepack pnpm release:check`: 成功
- `corepack pnpm spec:check`: 成功
- `corepack pnpm lint`: 成功
- `corepack pnpm typecheck`: 成功
- `corepack pnpm test`: 成功、Node 20件・UI 43件
- `corepack pnpm build`: 成功
- `cargo audit`: 成功、許可済み警告17件
- `cargo fmt --all -- --check`: 成功
- `cargo clippy --workspace --all-targets -- -D warnings`: 成功
- `cargo check --workspace`: 成功
- `cargo test --workspace`: 成功、46件成功・1件手動試験としてignore
- `cargo build --workspace`: 成功
- `git diff --check`: 成功

## CIで確認される内容

typecheck、format相当、lint、unit test、build、JS/Rust依存監査、
privacy audit、公開リポジトリ監査、Release metadata、Rust fmt・clippy・test・build。

## 未解決の課題

- `v0.1.3`のmacOS/Windows/Linux実機smoke testは未完了
- macOS/Windows署名とmacOS notarizationは未設定
- SBOMは未生成

## 次にやること

各OSの実機smoke testを記録し、元リポジトリの`Publish Beta Release`から
`v0.1.3`を公開する。

## 次回最初に見るべきファイル

- `.github/workflows/publish-beta-release.yml`
- `docs/release-checklist.md`
- `docs/TODO.md`

## 引き継ぎ事項

実機確認前に`smoke_tested`を有効化しない。公開側アカウントを開発端末へ
ログインさせず、登録済み`RELEASE_REPOSITORY_TOKEN`だけを使用する。
