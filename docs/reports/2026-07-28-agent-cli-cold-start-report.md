# 作業報告書

## 作業日時

2026年07月28日 22時19分09秒

## 作業対象

インストール済み `how-to-talk` CLIのAI Agent向けCRUD契約とブラックボックス動作。

## 作業目的

リポジトリを知らないAI Agentが、CLIのhelp・SPEC・Schemaだけで安全に全リソースをCRUDできる状態にする。

## 変更内容

- `cargo install --path crates/context-cue-cli --locked --force` で実環境へCLIを上書きインストールした。
- create / update / record / response / list-responseの操作別Schemaを追加した。
- createの既定値を実装とSchemaで共通化した。
- エラーコード、終了コード、削除レスポンス、日時・容量制約、互換バージョンをSPECへ明記した。
- 空update、id更新、未知フィールドを保存前に拒否する契約を揃えた。
- 会話履歴を渡していない別Agentに、全6リソースのCRUDを一時領域で実行させた。

## 変更したファイル

- `crates/context-cue-cli/src/args.rs`
- `crates/context-cue-cli/src/lib.rs`
- `crates/context-cue-cli/src/record_contract.rs`
- `crates/context-cue-cli/src/service.rs`
- `crates/context-cue-cli/src/spec.rs`
- `docs/SPEC.md`
- `docs/schemas/agent-cli.schema.json`
- `apps/desktop/src/features/documentation/generated/spec.generated.ts`
- `docs/TODO.md`
- `docs/reports/2026-07-28-installed-cli-black-box-crud-report.md`
- `docs/reports/2026-07-28-agent-cli-cold-start-report.md`

## 変更意図

Agentが保存済みレコードSchemaから作成・更新payloadを推測せず、実行中CLI自身から正確な契約を取得できるようにするため。

## 設計上の意図

既定値は `record_contract` に集約し、CRUD実装と生成Schemaで共有した。操作別Schemaは保存Schemaから実行時に導出し、型定義の二重管理を避けた。実データを使う検証は禁止し、毎回明示した `--data-dir` の一時領域へ隔離した。

## 影響範囲

Agent CLIのhelp、Schema、入力検証、同梱SPEC、アプリ内Documentationに影響する。workspaceの保存形式と既存レコードには変更がない。

## 追加・更新したテスト

- 全リソースで既定値がIDを含まず、生成レコードだけIDを持つこと
- create SchemaがIDを除外し、実装と同じ既定値を持つこと
- update SchemaがIDを除外し、1項目以上を要求すること
- item / list response Schemaが成功・失敗envelopeと終了コードを示すこと
- 空updateを拒否すること
- 未知フィールドのエラーが無関係なフィールド候補を露出しないこと

独立Agentは `/tmp/how-to-talk-agent-crud.hVVrER` を使い、Sessions / People / Projects / Reviews / Knowledge / Templatesのcreate、list、get、update、deleteと異常系をすべて成功させた。実ユーザー領域とデモ領域は使用していない。

## 実行した確認コマンド

- `cargo install --path crates/context-cue-cli --locked --force`
- `how-to-talk --version`
- `how-to-talk spec`
- `how-to-talk schema <resource> --operation <record|create|update|response|list-response>`
- `cargo fmt --all`
- `cargo clippy -p context-cue-cli --all-targets -- -D warnings`
- `cargo test -p context-cue-cli`
- `corepack pnpm spec:generate`
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
- `corepack pnpm audit --audit-level high`
- `cargo audit`
- 独立Agentによる全6リソースの隔離CRUD

全コマンドは成功した。TypeScriptは42件、SPECスクリプトは2件、Rustは36件成功・公式Whisper実機テスト1件ignoreだった。JavaScript依存に既知の脆弱性はなく、Rustは既存の許可済み警告18件のみだった。

## CIで確認される内容

TypeScriptのformat、lint、typecheck、unit test、build、SPEC同期と、Rustのfmt、clippy、check、test、build、依存脆弱性監査を確認する。今回ローカルでも同じ範囲を確認済み。

## 未解決の課題

- GitHub ReleasesへOS別CLIバイナリを添付する配布フローと、インストールsmoke testは未実装。
- 実際のAgent連携では、書込み前の差分表示と利用者承認を運用ルールとして追加する余地がある。
- `cargo audit`にはTauri依存由来の許可済み警告18件が残る。

## 次にやること

OS別CLI配布とインストールsmoke testをCIへ追加する。

## 次回最初に見るべきファイル

- `docs/SPEC.md`
- `crates/context-cue-cli/src/spec.rs`
- `crates/context-cue-cli/src/record_contract.rs`
- `.github/workflows/release.yml`

## 引き継ぎ事項

次回は `how-to-talk --version` と `how-to-talk schema knowledge --operation create` を最初に実行する。検証では必ず新しい一時ディレクトリを `--data-dir` に指定し、本人用既定領域を使わない。
