# 作業報告書

## 作業日時

2026年07月28日 21時02分50秒

## 作業対象

ダッシュボード共通レイアウトと、People / Projects / Templates / Reviewのページヘッダー。

## 作業目的

各画面がウィンドウ上端へ詰まって見える状態を解消し、見出し、操作、タブ、本文の間に一貫した余白を設ける。

## 変更内容

- アプリ全体の上余白を12pxから28pxへ広げた。
- サイドバーの上位置と高さを新しい外周余白に合わせた。
- ページ内の基本間隔を18pxへ統一した。
- 見出し行に検索、追加操作、タブをすべて詰め込まない構成へ変更した。
- People / Projects / Templates / Reviewのタブを独立した2行目へ移動した。
- 追加ボタンの文言が途中で改行されないようにした。
- タブ行へ下罫線を追加し、操作領域と一覧領域の境界を明確にした。

## 変更したファイル

- `apps/desktop/src/features/dashboard/pages/people-page.tsx`
- `apps/desktop/src/features/dashboard/pages/projects-page.tsx`
- `apps/desktop/src/features/dashboard/pages/review-page.tsx`
- `apps/desktop/src/features/dashboard/pages/templates-page.tsx`
- `apps/desktop/src/styles/globals.css`
- `docs/TODO.md`
- `docs/reports/2026-07-28-dashboard-spacing-report.md`

## 変更意図

単純にカードへ余白を足すだけでは、空データ画面の上部密度やヘッダーの折り返しが残る。共通シェルとヘッダー構造の両方を整え、すべての画面で同じ余白感になるようにした。

## 設計上の意図

外周余白は共通シェル、画面内の縦間隔は共通ページクラス、タブの配置は各feature pageが担当する。既存のfeature-driven構成と状態管理は変更せず、表示責務だけを調整した。新しい依存ライブラリは追加していない。

## 影響範囲

Home、Sessions、People、Projects / Companies、My Knowledge、Templates、Review、Overlay Settingsの配置。保存データ、CRUD、Tauri IPC、音声・LLM処理には影響しない。

## 追加・更新したテスト

ロジック変更はないため新規テストは追加していない。既存の全フロントエンドテストとRustテストで回帰がないことを確認した。

## 実行した確認コマンド

- `corepack pnpm --filter desktop lint`: 成功
- `corepack pnpm --filter desktop typecheck`: 成功
- `corepack pnpm --filter desktop test`: 38件成功
- `corepack pnpm --filter desktop build`: 成功
- `cargo fmt --all -- --check`: 成功
- `cargo clippy --workspace --all-targets -- -D warnings`: 成功
- `cargo check --workspace`: 成功
- `cargo test --workspace`: 29件成功、実機Whisperテスト1件は意図どおりignore
- `cargo build --workspace`: 成功
- macOS上でアプリを実起動し、スクリーンショットで上余白とカード配置を確認

## CIで確認される内容

JavaScript依存監査、lint、typecheck、unit test、build、Rust依存監査、fmt、clippy、check、test、build。

## 未解決の課題

既存の`globals.css`は300行を超えている。今回の表示修正と大規模なCSS分割を混在させないため、画面・共通要素単位への分割は別タスクとした。

## 次にやること

空状態の案内と主要アクションを各一覧画面へ追加し、データがない場合でも次に取る操作が分かるようにする。

## 次回最初に見るべきファイル

- `apps/desktop/src/styles/globals.css`
- `apps/desktop/src/features/dashboard/components/dashboard-shell.tsx`
- `apps/desktop/src/features/dashboard/pages/templates-page.tsx`

## 引き継ぎ事項

デスクトップでは外周28pxを基準にする。860px以下では既存のモバイル向け12pxへ戻る。ヘッダーのタブを再び検索・追加ボタンと同じ行へ戻さない。
