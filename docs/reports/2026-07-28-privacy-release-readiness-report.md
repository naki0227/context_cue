# 作業報告書

## 作業日時

2026年07月28日 23時10分56秒

## 作業対象

リポジトリ全体の個人情報監査、CI、Release workflow、macOS release bundle、公開文書。

## 作業目的

公開対象ファイルと成果物から不要な個人情報を除去し、リリース準備を外部依存のある項目以外まで進める。

## 変更内容

- 実名、個人ハンドル、ローカル絶対パス、個人由来bundle identifierを匿名化した
- デモ人物を役割ラベルへ、メールを予約済み`.invalid`ドメインへ変更した
- privacy auditとrelease version/tag preflightを追加し、CIへ組み込んだ
- Release workflowへCI相当quality gate、4ターゲットCLI build、隔離CRUD smoke、SHA-256添付を追加した
- GitHub ActionsをNode 24対応majorへ更新し、pnpmを11.17.0へ統一した
- Rust/C/C++ build path remappingを追加した
- サンプルKnowledgeをcompile-time埋め込みへ変更し、bundleのソースパス依存を除去した
- `anyhow`をRustSec修正版1.0.103へ更新した
- Privacy Notice、安全利用・同意ガイド、CHANGELOG、release checklist、ADRを追加した
- 生成キャッシュとローカルbundleを検証後に削除した

## 変更したファイル

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.gitignore`
- `Cargo.lock`
- `Cargo.toml`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `PRIVACY.md`
- `package.json`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/src/config.rs`
- `apps/desktop/src-tauri/src/repository/profile_repository.rs`
- `apps/desktop/src/features/dashboard/lib/workspace-seed.ts`
- `apps/desktop/test/app-icon.test.ts`
- `apps/desktop/test/app.test.tsx`
- `apps/desktop/test/workspace-normalize.test.ts`
- `docs/TODO.md`
- `docs/architecture.md`
- `docs/production-readiness-audit.md`
- `docs/release.md`
- `docs/release-checklist.md`
- `docs/safety-and-consent.md`
- `docs/schemas/agent-cli.schema.json`
- `docs/adr/0005-release-identity-and-privacy-gate.md`
- `scripts/privacy-audit.mjs`
- `scripts/privacy-audit.test.mjs`
- `scripts/release-preflight.mjs`
- `scripts/release-preflight.test.mjs`
- `scripts/tauri-build.mjs`
- `scripts/tauri-build.test.mjs`
- `docs/reports/2026-07-28-privacy-release-readiness-report.md`

## 変更意図

公開成果物に個人identityや開発端末のpathを含めず、同じ問題をCIで再発防止するため。証明書や実機なしで実行できるrelease準備を先に完了させるため。

## 設計上の意図

追加依存を避け、Node標準ライブラリでprivacy auditとpreflightを実装した。公開前にbundle identifierを`app.contextcue.desktop`へ固定した。Releaseはquality gate成功後もdraftを維持し、署名・実機確認を人手の最終gateとした。

Git履歴書換えはcommit ID、clone、PR、tagへ破壊的影響があるため、この作業には含めなかった。

## 影響範囲

- bundle identifier変更により、以前の開発用workspaceは自動移行されない
- デモの人物表示と内部person IDが役割ベースへ変わる
- サンプルKnowledgeは配布bundleでも利用できる
- Release workflowは通常CI相当検証後にのみ成果物を作る
- CLI archive名とchecksumがRelease assetsへ追加される

DB、外部API、本人用workspaceの変更はない。

## 追加・更新したテスト

- privacy auditの許可・拒否・非露出テスト
- version/tag/package manager整合性テスト
- Rust/C/C++ path remapフラグのテスト
- bundle identifier固定テスト
- サンプルKnowledgeのcompile-time埋め込みテスト
- デモ人物匿名化に伴う既存UI・正規化テスト更新

## 実行した確認コマンド

- `corepack pnpm install --frozen-lockfile`
- `corepack pnpm audit --audit-level high`
- `corepack pnpm audit:privacy`
- `corepack pnpm release:check -- --tag v0.1.0`
- `corepack pnpm spec:check`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo check --workspace`
- `cargo test --workspace`
- `cargo build --workspace`
- `cargo audit`
- `corepack pnpm tauri:build`
- `codesign --verify --deep --strict --verbose=2 <app>`
- bundle内の既知identity、絶対home path、Info.plist監査
- workflow YAML parse、`git diff --check`

結果:

- Node単体テスト11件成功
- Vitest 43件成功
- Rust 45件成功、公式Whisper実機テスト1件は意図的ignore
- JavaScript既知脆弱性0件
- `cargo audit`は終了成功、警告17件
- macOS arm64 `.app` / `.dmg`生成成功
- clean bundle内の既知個人identityと絶対home pathは0件
- bundle identifierは`app.contextcue.desktop`
- macOS署名はad-hocでstrict検証失敗

## CIで確認される内容

- pnpm frozen install、依存監査、privacy audit、release metadata、SPEC同期
- frontend lint、typecheck、unit test、build
- Rust audit、fmt、clippy、check、test、build
- tag Releaseでは上記quality gate後に3 OSアプリbuild
- 4ターゲットCLI build、隔離CRUD smoke、archive、SHA-256添付

## 未解決の課題

- `.git`の59コミットに非noreply author metadataがあり、remoteにも個人identityがある
- macOS署名・公証とWindows署名が未設定
- 3 OS実機install smoke testが未実施
- アプリ成果物SBOMとTauri Updaterが未実装
- Playwright主要CRUD E2Eと障害系integration testが不足
- Rust監査に17件の警告があり、`glib 0.18.5`はLinux向けTauri経路のunsound警告
- tracked fileには`com.apple.provenance` xattrがあるが、GitとRelease workflowはxattrを配布しない

## 次にやること

1. 公開先を非個人Organizationへ移管する
2. backupを取得してGit author metadataの履歴書換え方針を承認する
3. Apple / Windows署名identityを設定する
4. draft Releaseを実行し、4 OS/targetでinstall smoke testする
5. SBOM、Updater、主要E2Eを追加する

## 次回最初に見るべきファイル

- `docs/release-checklist.md`
- `docs/production-readiness-audit.md`
- `.github/workflows/release.yml`
- `docs/adr/0005-release-identity-and-privacy-gate.md`
- `docs/TODO.md`

次回最初に実行するコマンド:

`corepack pnpm audit:privacy && corepack pnpm release:check -- --tag v0.1.0`

## 引き継ぎ事項

履歴書換えを通常の機能変更と同じcommitで行わない。実行前にremote backup、保護branch、open PR、tag、他cloneへの影響を確認する。

旧開発版のworkspaceが必要なら、bundle identifier変更前の版でJSON exportしてから移行する。生成済み`target`、`node_modules`、`.pnpm-store`、frontend `dist`は削除済みで、再検証には依存installとrebuildが必要。
