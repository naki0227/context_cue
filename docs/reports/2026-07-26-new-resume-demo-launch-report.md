# 作業報告書

## 作業日時

2026年07月26日 15時59分36秒

## 作業対象

デスクトップアプリの起動モード、本人用ワークスペースの復元・退避処理、
ローカル保存先、起動スクリプト、起動モード別テスト。

## 作業目的

シードが保存済みの本人用領域を通常起動が読み込む問題を修正し、新規・再開・
デモの3つの起動方法を安全に提供する。

## 変更内容

- 起動モードを `new` / `resume` / `demo` の3種類にした。
- `new` と `resume` は同じ本人用保存領域を使うようにした。
- `demo` だけをデモ専用保存領域へ分離した。
- `new` 起動時は既存の本人用JSONを日時付きバックアップへ退避するようにした。
- ダッシュボード実データのZustand永続化を廃止し、RustのJSONだけを正本にした。
- `resume` と起動モード未指定時は本人用JSONを復元するようにした。
- フロントとRustの起動モードを照合し、不一致の古いウィンドウを操作不能にした。
- `user` 指定は後方互換のため `resume` として扱うようにした。
- サイドバーに `New Workspace` / `Demo Workspace` の識別表示を追加した。
- 3種類の開発用起動コマンドを追加した。

## 変更したファイル

- `README.md`
- `docs/architecture.md`
- `package.json`
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src-tauri/src/config.rs`
- `apps/desktop/src-tauri/src/infrastructure/persistence.rs`
- `apps/desktop/src-tauri/src/lib.rs`
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/features/dashboard/components/app-sidebar.tsx`
- `apps/desktop/src/features/dashboard/hooks/use-dashboard-controller.ts`
- `apps/desktop/src/lib/config/launch-mode.ts`
- `apps/desktop/src/lib/state/app-store.ts`
- `apps/desktop/src/lib/state/workspace-defaults.ts`
- `apps/desktop/src/lib/state/workspace-store.ts`
- `apps/desktop/src/lib/tauri/commands.ts`
- `apps/desktop/src/lib/tauri/use-launch-mode-guard.ts`
- `apps/desktop/src/styles/globals.css`
- `apps/desktop/test/launch-mode-guard.test.tsx`
- `apps/desktop/test/launch-mode.test.ts`
- `apps/desktop/test/user-launch.test.tsx`
- `apps/desktop/vitest.user.config.ts`
- `docs/TODO.md`
- `docs/reports/2026-07-26-new-resume-demo-launch-report.md`

## 変更意図

単なる保存先分離では、本人用領域に過去のシードが保存済みの場合に再表示される。
新規起動と再開の意味を分け、データを失わず空の本人環境を作れるようにした。

## 設計上の意図

本人用保存領域は1つに保ち、新規と再開の差は起動時の処理だけに限定した。
新規起動時も既存ファイルを削除せず、同じディレクトリへバックアップしてから
空状態を保存する。デモだけ物理保存先と設定用ブラウザ保存キーを分離する。
ダッシュボードを二重永続化せず、Rustの保存層へ書き込み経路を一本化する。

## 影響範囲

アプリ起動時のデータ復元、本人用JSONのバックアップ、Zustandの永続化範囲、
サイドバーの環境表示、開発用起動コマンド。既存CRUDのデータ構造は変更していない。

## 追加・更新したテスト

- `new` / `resume` / `demo` と旧 `user` のモード判定
- 新規・再開で空の初期ワークスペースを使うこと
- 新規・再開が同じ設定保存プロファイルを使い、デモだけ分離されること
- 新規起動でシードが表示されず最初のセッションを追加できること
- Rustで既存JSONをバックアップし、空の本人用状態を返すこと
- Rustでバックアップ後も元データが退避ファイルに残ること
- フロントとRustのモード一致時だけ起動を許可し、不一致時は遮断すること

## 実行した確認コマンド

- `corepack pnpm --filter desktop lint`
- `corepack pnpm --filter desktop typecheck`
- `corepack pnpm --filter desktop test`
- `corepack pnpm --filter desktop build`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo check --workspace`
- `cargo test --workspace`
- `cargo build --workspace`
- `corepack pnpm tauri:dev:new`
- `corepack pnpm tauri:dev:resume`
- `jq` による本人用JSONとバックアップの件数確認

すべて成功。Frontendは19件、Rustは13件のテストが通過した。実起動では
`new`が既存本人用JSONを3件目のバックアップへ退避し、`resume`は
バックアップを増やさず空状態を維持した。空状態は最初の編集までJSONを
生成しない。デモ用JSONの更新時刻は両起動の前後で変化しなかった。

## CIで確認される内容

Frontendのlint、typecheck、デモ・新規モードのtest、build。
Rustのfmt、clippy、check、test、build。

## 未解決の課題

macOSの画面収録権限がないため、自動スクリーンショット比較は実行できない。
起動ログ、保存JSON、モード別UIテストで代替確認している。

## 次にやること

Playwrightで主要CRUDとrelation編集のE2Eテストを追加する。

## 次回最初に見るべきファイル

- `apps/desktop/src-tauri/src/infrastructure/persistence.rs`
- `apps/desktop/src/lib/config/launch-mode.ts`
- `apps/desktop/src/lib/state/workspace-defaults.ts`
- `apps/desktop/test/user-launch.test.tsx`
- `docs/TODO.md`

## 引き継ぎ事項

`new`と`resume`は同じ本人用領域を使い、`demo`だけ別領域を使う。
配布版とモード未指定時は`resume`。新規起動で作成したバックアップを自動削除
しないこと。旧 `tauri:dev:user` は再開の別名として残している。開発中に
別モードへ切り替えても、起動モードガードが保存開始前に不一致を遮断する。
