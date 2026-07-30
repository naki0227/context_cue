# 作業報告書

## 作業日時

2026年07月30日 17時56分29秒

## 作業対象

未署名ベータ版のGitHub Release本文、Release workflow、配布手順。

## 作業目的

未署名成果物であることを明示し、利用者がOS全体の保護を無効化せずに
対象アプリだけを許可できる安全な案内をReleaseへ掲載する。

## 変更内容

- Release本文へベータ版、未署名・未公証、管理端末での制約を明記した
- macOS GatekeeperとWindows SmartScreenで対象アプリだけを許可する手順を追加した
- SHA-256照合、取得元確認、個人情報を含めないIssue報告を案内した
- 今後のReleaseをGitHub Pre-releaseとして作成するよう変更した
- OS全体の保護を無効化する案内が混入しない回帰テストを追加した

## 変更したファイル

- `.github/workflows/release.yml`
- `scripts/release-workflow.test.mjs`
- `docs/release.md`
- `docs/TODO.md`
- `docs/reports/2026-07-30-unsigned-beta-release-guidance-report.md`

## 変更意図

個人名義の署名を使わない公開方針を維持しつつ、未署名である事実と
利用時の制約を隠さず、必要以上に端末の安全性を下げないため。

## 設計上の意図

Release本文をworkflowに保持し、タグごとの手作業による記載漏れを防ぐ。
回避方法は端末全体ではなく対象アプリ単位に限定し、管理ポリシーを尊重する。

## 影響範囲

GitHub Releaseの区分と説明文のみ。アプリ、保存データ、API、DBへの影響はない。

## 追加・更新したテスト

`scripts/release-workflow.test.mjs`へ、Pre-release指定、安全案内、
危険なGatekeeper無効化手順がないことの検査を追加した。

## 実行した確認コマンド

- `corepack pnpm audit --audit-level high`: 成功、既知脆弱性0件
- `corepack pnpm audit:privacy`: 成功
- `corepack pnpm audit:release-repository`: 成功
- `corepack pnpm release:check`: 成功
- `corepack pnpm spec:check`: 成功
- `corepack pnpm lint`: 成功
- `corepack pnpm typecheck`: 成功
- `corepack pnpm test`: 成功、Node 19件・UI 43件
- `corepack pnpm build`: 成功
- `cargo audit`: 成功、許可済み警告17件
- `cargo fmt --all -- --check`: 成功
- `cargo clippy --workspace --all-targets -- -D warnings`: 成功
- `cargo check --workspace`: 成功
- `cargo test --workspace`: 成功、46件成功・1件手動試験としてignore
- `cargo build --workspace`: 成功
- `git diff --check`: 成功
- `gh release edit v0.1.3 --repo enludus/How-to-talk ...`: 未反映。
  現在のGitHub CLI認証が無効で、draftを参照できず`release not found`

## CIで確認される内容

typecheck、format相当、lint、unit test、build、JS/Rust依存監査、
privacy audit、公開リポジトリ監査、Release metadata、Rust fmt・clippy・test・build。

## 未解決の課題

- macOS/Windowsの実成果物で案内どおり起動できるか実機確認が必要
- macOS/Windowsのコード署名とmacOS notarizationは未設定
- SBOMは未生成
- 現在の`v0.1.3` draft本文は、`enludus`認証がないため未更新

## 次にやること

`enludus`認証で`v0.1.3` draftへ本文を反映する。その後、各OSでsmoke testし、
問題がなければPre-releaseとして公開する。

## 次回最初に見るべきファイル

- `.github/workflows/release.yml`
- `docs/release-checklist.md`
- `docs/TODO.md`

## 引き継ぎ事項

GatekeeperやSmartScreen全体を無効化する手順は追加しない。
「壊れている」と表示される成果物や管理対象端末では迂回を求めない。
署名を追加する場合は、公開されるcertificate identityを事前確認する。
GitHub Actionsの`RELEASE_REPOSITORY_TOKEN`はSecretから取り出せないため、
既存draftの手動更新には`enludus`の管理権限がある認証が必要。
