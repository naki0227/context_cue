# 作業報告書

## 作業日時

2026年07月26日 19時06分18秒

## 作業対象

My Knowledgeの出典、確度、機密度と詳細編集の責務分離。

## 作業目的

AIが参照する個人情報について、事実の根拠と取扱注意度を利用者自身が明示できるようにする。

## 変更内容

- Knowledgeへ出典、確度、機密度を追加した。
- 新規手入力は`本人入力 / 未確認 / 個人`、基礎プロフィールは`本人入力 / 確認済み / 個人`を既定値にした。
- Importはファイル名を出典として保持するようにした。
- 既存レコードは任意フィールドとして互換的に読み、UIでは安全寄りの既定値を表示する。
- 詳細編集UIを専用コンポーネントへ分離した。

## 変更したファイル

- `apps/desktop/src/features/dashboard/lib/workspace-types.ts`
- `apps/desktop/src/lib/schemas/workspace-state.ts`
- `apps/desktop/src/lib/state/workspace-store-builders.ts`
- `apps/desktop/src/features/dashboard/lib/knowledge-profile.ts`
- `apps/desktop/src/features/dashboard/components/knowledge/knowledge-detail-editor.tsx`
- `apps/desktop/src/features/dashboard/pages/knowledge-page.tsx`
- 関連テストと`docs/TODO.md`

## 変更意図

AI整理やセッション参照の前に、情報の確度と機密性を機械判定できるデータとして持たせるため。

## 設計上の意図

既存JSONを破壊しない任意フィールドとして段階導入した。詳細編集を121行の表示コンポーネントへ分離し、ページ側は一覧選択とCRUD調停に限定した。

## 影響範囲

My Knowledgeの新規作成、Import、基礎プロフィール、詳細編集、workspaceの読込・保存・export。

## 追加・更新したテスト

- 基礎プロフィールの確度と機密度の既定値。
- 新規workspaceで機密度を編集できる統合フロー。

## 実行した確認コマンド

- `corepack pnpm lint`: 成功
- `corepack pnpm typecheck`: 成功
- `corepack pnpm test`: 27件成功
- `corepack pnpm build`: 成功

## CIで確認される内容

Frontendのformat、lint、typecheck、test、build、`pnpm audit`と、Rustのfmt、clippy、check、test、build、`cargo audit`。

## 未解決の課題

AI整理前previewと差分承認、およびセッションごとの参照Knowledge選択は未実装。

## 次にやること

原文を上書きしないAI整理draftと承認フローを実装する。

## 次回最初に見るべきファイル

- `apps/desktop/src/features/dashboard/components/knowledge/knowledge-detail-editor.tsx`
- `apps/desktop/src/features/dashboard/lib/workspace-types.ts`
- `apps/desktop/src-tauri/src/infrastructure/ollama_client.rs`

## 引き継ぎ事項

既存workspace互換のためメタデータは任意型。利用箇所では`未確認 / 個人`を安全な既定値として扱う。
