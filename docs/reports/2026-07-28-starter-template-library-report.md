# 作業報告書

## 作業日時

2026年07月28日 20時50分25秒

## 作業対象

本人用ワークスペースのTemplates、初期データ、保存データ移行。

## 作業目的

デモデータを除外した本人用モードでも、個人情報を含まない実用的な標準テンプレートを最初から利用できるようにする。

## 変更内容

- 汎用的な標準テンプレートを6件追加した。
- 新規本人用ワークスペースへ標準テンプレートを初期配置した。
- 既存本人用ワークスペースへ一度だけ追加するマイグレーションを実装した。
- `templateLibraryVersion`を保存し、導入後に削除したテンプレートが勝手に復活しないようにした。
- 移行結果を既存のローカル保存層へ保存した。
- 移行保存だけが失敗した場合の専用エラーメッセージを追加した。
- 起動中の本人用保存領域でライブラリ版1、テンプレート6件の保存を確認した。

## 変更したファイル

- `apps/desktop/src/features/dashboard/hooks/use-workspace-persistence.ts`
- `apps/desktop/src/features/dashboard/lib/starter-templates.ts`
- `apps/desktop/src/features/dashboard/lib/workspace-migrations.ts`
- `apps/desktop/src/features/dashboard/lib/workspace-normalize.ts`
- `apps/desktop/src/features/dashboard/lib/workspace-seed.ts`
- `apps/desktop/src/lib/schemas/workspace-state.ts`
- `apps/desktop/src/lib/state/workspace-defaults.ts`
- `apps/desktop/src/lib/state/workspace-store-types.ts`
- `apps/desktop/src/lib/state/workspace-store-utils.ts`
- `apps/desktop/src/lib/state/workspace-store.ts`
- `apps/desktop/test/user-launch.test.tsx`
- `apps/desktop/test/workspace-migrations.test.ts`
- `docs/TODO.md`
- `docs/reports/2026-07-28-starter-template-library-report.md`

## 変更意図

テンプレートは人物・企業・セッションのデモ記録ではなく、アプリの基本機能として扱うべきため。単純な空配列初期化では既存利用者が空のままになるため、版管理された一度きりの移行を採用した。

## 設計上の意図

テンプレート定義、純粋な移行関数、永続化処理を分離した。導入済み版を保存することで、利用者の編集・削除を尊重する。新しい依存ライブラリは追加していない。

## 影響範囲

新規・再開・デモのworkspace snapshot、Homeのテンプレート件数、Templates一覧。人物、企業、Knowledge、会話ログ、音声・LLM処理には影響しない。

## 追加・更新したテスト

- 旧workspaceへ標準テンプレート6件が導入されること
- 導入後に全削除しても再生成されないこと
- 新規ユーザーHomeに6件と表示されること
- 新規ユーザーTemplatesに標準カードが表示されること

## 実行した確認コマンド

- `corepack pnpm --filter desktop lint`: 成功
- `corepack pnpm --filter desktop typecheck`: 成功
- `corepack pnpm --filter desktop test`: 38件成功
- `corepack pnpm --filter desktop build`: 成功
- `corepack pnpm audit --audit-level high`: 既知脆弱性0件
- `cargo fmt --all -- --check`: 成功
- `cargo clippy --workspace --all-targets -- -D warnings`: 成功
- `cargo check --workspace`: 成功
- `cargo test --workspace`: 29件成功、実機Whisperテスト1件は意図どおりignore
- `cargo build --workspace`: 成功
- `cargo audit`: 成功、許可済み警告18件
- 本人用保存JSONのテンプレート件数と版のみを`jq`で確認: 版1、6件

## CIで確認される内容

JavaScript依存監査、lint、typecheck、unit test、build、Rust依存監査、fmt、clippy、check、test、build。

## 未解決の課題

標準テンプレートの追加配布を将来行う場合は、版2の移行内容と既存カスタマイズの優先規則を決める必要がある。

## 次にやること

実際の利用フィードバックをもとに本文項目を調整し、必要ならテンプレート複製機能を追加する。

## 次回最初に見るべきファイル

- `apps/desktop/src/features/dashboard/lib/starter-templates.ts`
- `apps/desktop/src/features/dashboard/lib/workspace-migrations.ts`
- `apps/desktop/src/features/dashboard/hooks/use-workspace-persistence.ts`

## 引き継ぎ事項

`templateLibraryVersion`を下げない。標準IDを変更すると重複導入されるため、タイトル変更時もIDは維持する。テンプレートへ個人情報や特定利用者の内容を含めない。
