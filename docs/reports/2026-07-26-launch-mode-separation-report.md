# 作業報告書

## 作業日時

2026年07月26日 15時18分09秒

## 作業対象

デスクトップアプリの起動モード、フロントエンド初期状態、ローカル保存先、
起動スクリプト、起動モード別テスト。

## 作業目的

シードデータを使うデモ環境と、本人の情報だけを保存する通常環境を分離し、
相互にデータや設定が混ざらないようにする。

## 変更内容

- `demo` と `user` の起動モードを追加した。
- 通常起動は空の Sessions / People / Projects / Review / Knowledge /
  Templates から開始するようにした。
- デモ起動だけが既存のシードデータを初期表示するようにした。
- RustのJSON保存先とZustandの保存キーをモード別に分離した。
- 旧開発版の `workspace-state.json` は変更せず、新版の
  `workspace-state-v2.json` を使用するようにした。
- サイドバーでデモ起動時だけ `Demo Workspace` と表示するようにした。
- 通常起動とデモ起動の専用コマンドを追加した。

## 変更したファイル

- `package.json`
- `README.md`
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/src/config.rs`
- `apps/desktop/src/features/dashboard/components/app-sidebar.tsx`
- `apps/desktop/src/lib/config/launch-mode.ts`
- `apps/desktop/src/lib/state/app-store.ts`
- `apps/desktop/src/lib/state/workspace-defaults.ts`
- `apps/desktop/src/lib/state/workspace-store.ts`
- `apps/desktop/src/lib/state/workspace-store-builders.ts`
- `apps/desktop/src/lib/tauri/commands.ts`
- `apps/desktop/src/vite-env.d.ts`
- `apps/desktop/test/app.test.tsx`
- `apps/desktop/test/launch-mode.test.ts`
- `apps/desktop/test/user-launch.test.tsx`
- `apps/desktop/vitest.config.ts`
- `apps/desktop/vitest.user.config.ts`
- `docs/TODO.md`

## 変更意図

配布版に架空の人物・企業・面談履歴が自動投入される状態を避けるため。
デモ操作で作成した情報が通常利用の個人情報保存領域へ混ざることも防ぐ。

## 設計上の意図

既存のTauri、React、Zustand、JSON保存を維持し、新規依存を増やしていない。
モード判定と初期ワークスペース生成を小さな純粋関数へ分離し、UIやCRUDの
実装から起動環境の条件分岐を隔離した。

## 影響範囲

アプリ初回起動時の表示データ、ダッシュボードと設定のローカル保存先、
開発用起動コマンド。CRUDのデータ構造と既存画面の操作仕様は変更していない。

## 追加・更新したテスト

- 起動モードの既定値と明示的なデモ判定
- 通常モードの空ワークスペース
- デモモードのシード投入
- モード別ブラウザ保存キー
- 通常モードでシードが表示されず、最初のセッションを追加できること
- Rust側の起動モード判定
- デモ表示ラベル

## 実行した確認コマンド

- `corepack pnpm --filter desktop lint`
- `corepack pnpm --filter desktop typecheck`
- `corepack pnpm --filter desktop test`
- `VITE_CONTEXT_CUE_LAUNCH_MODE=user corepack pnpm --filter desktop build`
- `VITE_CONTEXT_CUE_LAUNCH_MODE=demo corepack pnpm --filter desktop build`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo check --workspace`
- `cargo test --workspace`
- `cargo build --workspace`
- `corepack pnpm tauri:dev:user`
- `corepack pnpm tauri:dev:demo`

## CIで確認される内容

Frontendのlint、typecheck、デモ・通常モードのunit/integration test、build。
Rustのfmt、clippy、check、test、build。

## 未解決の課題

macOSの画面収録権限がないため、OSスクリーンショットによる自動視覚確認は
実行できなかった。起動ログ、モード別テスト、両モードのbuildで代替確認した。

## 次にやること

Playwrightで主要CRUDとrelation編集のE2Eテストを追加する。

## 次回最初に見るべきファイル

- `apps/desktop/src/lib/config/launch-mode.ts`
- `apps/desktop/src/lib/state/workspace-defaults.ts`
- `apps/desktop/test/user-launch.test.tsx`
- `docs/TODO.md`

## 引き継ぎ事項

通常起動は `corepack pnpm tauri:dev:user`、デモ起動は
`corepack pnpm tauri:dev:demo`。モード未指定と配布用ビルドは通常モード。
旧 `workspace-state.json` は削除・移行していないため触らないこと。
