# 作業報告書

## 作業日時

2026年07月28日 21時42分00秒

## 作業対象

AI Agent向けCRUD CLI、共通workspace保存層、製品SPEC、アプリ内Documentation。

## 作業目的

Sessions、People、Projects、Reviews、Knowledge、TemplatesをAI AgentがローカルCLIから安全に参照・追加・編集・削除でき、同じ仕様をアプリとCLIで確認できる状態にする。

## 変更内容

- `how-to-talk`へ`path / list / get / create / update / delete / spec / schema`を追加した
- JSON引数、JSONファイル、stdin入力と機械可読な成功・エラー出力を追加した
- 6リソースの型検証、ID自動生成、部分更新、削除後の関連正規化を実装した
- GUIの保存処理を`context-cue-workspace`へ移し、CLIと原子的保存・権限・上限を共有した
- デスクトップ起動中のCLI変更を拒否するworkspace排他ロックを追加した
- `docs/SPEC.md`を正本に、アプリ内検索表示、CLI全文表示、JSON Schema取得を追加した
- Overlay SettingsへAI Agent連携カードと安全なコマンド例を追加した
- SPEC生成物の同期検査をCIへ追加した

## 変更したファイル

- `crates/context-cue-cli/`
- `crates/context-cue-workspace/`
- `apps/desktop/src-tauri/src/infrastructure/persistence/`
- `apps/desktop/src-tauri/src/app.rs`
- `apps/desktop/src/features/documentation/`
- `apps/desktop/src/features/dashboard/components/settings/settings-agent-card.tsx`
- `apps/desktop/src/features/dashboard/pages/settings-page.tsx`
- `docs/SPEC.md`
- `docs/schemas/agent-cli.schema.json`
- `docs/adr/0003-single-source-product-spec.md`
- `docs/adr/0004-agent-cli-shared-workspace.md`
- `scripts/`
- `.github/workflows/ci.yml`
- `README.md`

## 変更意図

AI Agent用に別DBやlocalhost APIを持たず、既存のローカルファースト方針を保つため。同時書込みによる個人データの消失を防ぎ、Agentが仕様を推測せず利用できる契約を提供するため。

## 設計上の意図

保存の技術詳細は共通crate、CRUDはCLIのservice、パスと永続化はrepository、引数と出力はpresentationとして分離した。各ファイルは300行以内に収めた。SPECはMarkdown一つを正本にし、アプリ用生成物をCIで同期検査する。

## 影響範囲

デスクトップのworkspace初期化・保存・全削除、ダッシュボードのDocumentation導線、Overlay Settings、Rust workspace、CI、リリース前ドキュメントに影響する。保存JSONのschema versionとフィールド形式は変更していない。

## 追加・更新したテスト

- CLI CRUDの追加・取得・更新・一覧・削除
- CLI削除後の人物・プロジェクト関連正規化
- workspace排他ロック
- 不正フィールド拒否と全リソースSchema埋込み
- 共通保存層の0600権限、復旧、サイズ・構造検証
- アプリ内SPECの検索・表示
- Overlay SettingsのAI Agent連携ガイド

## 実行した確認コマンド

- `corepack pnpm spec:check`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `corepack pnpm audit --audit-level high`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo check --workspace`
- `cargo test --workspace`
- `cargo build --workspace`
- `cargo audit`
- 一時workspaceでCLIのcreate / get / update / list / delete / spec / schemaを実行

すべて成功した。Frontendは42テスト、Rustは37テスト成功、Whisper実機テスト1件は意図的にignore。`cargo audit`は既存の許可済み警告18件のみ。

## CIで確認される内容

SPEC同期、JavaScript依存監査、lint、typecheck、Frontend test/build、Rust依存監査、fmt、clippy、check、test、build。

## 未解決の課題

- GitHub ReleaseへOS別CLIバイナリを添付していない
- アプリ起動中のCLI変更は安全のため拒否し、参照だけ許可している
- cargo-auditの許可済み警告18件はTauri更新時に再評価が必要

## 次にやること

OS別CLI成果物をRelease workflowへ追加し、新規環境でインストールとCRUD smoke testを行う。

## 次回最初に見るべきファイル

- `docs/SPEC.md`
- `crates/context-cue-cli/src/args.rs`
- `crates/context-cue-cli/src/repository.rs`
- `crates/context-cue-workspace/src/file_store.rs`
- `.github/workflows/release.yml`

## 引き継ぎ事項

次回は`corepack pnpm spec:check`と`cargo test --workspace`を最初に実行する。`docs/SPEC.md`が正本であり、生成ファイルは直接編集しない。デスクトップが保持する排他ロックを外して同時書込みを許可しない。workspace schema変更時はRust型、TypeScript Zod、JSON Schema、SPECを同時更新する。
