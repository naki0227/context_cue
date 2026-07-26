# 作業報告書

## 作業日時

2026年07月26日 18時51分08秒

## 作業対象

User基礎情報とMy Knowledgeオンボーディング。

## 作業目的

新規利用者が入力内容に迷わず、個人情報の扱いを理解したうえで会話支援に必要な最小情報を登録できるようにする。

## 変更内容

- 呼ばれたい名前、所属・役割、現在の活動、利用場面を登録するUIを追加した。
- 基礎情報を予約IDのKnowledge項目として既存workspaceへ保存した。
- 保存した名前をHomeとサイドバーへ反映した。
- 経験、強み、NG事項の入力テンプレートを追加した。
- AI整理用promptをアプリ内で閲覧・コピーできるようにした。
- 秘密鍵、本人確認番号などを入力しない注意を表示した。

## 変更したファイル

- `apps/desktop/src/features/dashboard/lib/knowledge-profile.ts`
- `apps/desktop/src/features/dashboard/components/knowledge/knowledge-onboarding-card.tsx`
- `apps/desktop/src/features/dashboard/pages/knowledge-page.tsx`
- `apps/desktop/src/features/dashboard/components/app-sidebar.tsx`
- `apps/desktop/src/features/dashboard/pages/home-page.tsx`
- `apps/desktop/src/styles/globals.css`
- `apps/desktop/test/knowledge-profile.test.ts`
- `apps/desktop/test/user-launch.test.tsx`
- `docs/TODO.md`

## 変更意図

基礎情報を別の保存形式に分散させず、手入力・importと同じ削除、export、バックアップ経路で扱うため。

## 設計上の意図

Knowledgeレコードとの変換は純粋関数、入力状態は専用コンポーネント、一覧CRUDは既存ページに分離した。新規ファイルは最大156行、Knowledgeページは275行に収めた。

## 影響範囲

My Knowledge、Homeの挨拶、サイドバーのUser表示、workspace永続化とexport。

## 追加・更新したテスト

- 基礎情報とKnowledgeレコードの往復変換。
- 未登録時に個人を特定しない`User`へフォールバックすること。
- 新規workspaceで基礎情報を保存し、Homeへ名前が反映される統合フロー。

## 実行した確認コマンド

- `corepack pnpm lint`: 成功
- `corepack pnpm typecheck`: 成功
- `corepack pnpm test`: 27件成功
- `corepack pnpm build`: 成功

## CIで確認される内容

Frontendのformat、lint、typecheck、test、build、`pnpm audit`と、Rustのfmt、clippy、check、test、build、`cargo audit`。

## 未解決の課題

AI整理はpromptの閲覧・コピーまでで、送信内容preview、差分承認、出典・確度・機密度の構造化は未実装。

## 次にやること

My KnowledgeのAI整理previewと承認フローをローカルLLMへ接続する。

## 次回最初に見るべきファイル

- `apps/desktop/src/features/dashboard/lib/knowledge-profile.ts`
- `apps/desktop/src/features/dashboard/pages/knowledge-page.tsx`
- `apps/desktop/src-tauri/src/usecase/llm_usecase.rs`

## 引き継ぎ事項

基礎情報の予約IDは`knowledge-user-profile`。削除・exportは通常のKnowledge項目と同じ経路を使う。
