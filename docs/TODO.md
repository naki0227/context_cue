# TODO

## 進行中

- [進行中] Projects / Review の 300 行超ファイルをさらに分割する
- [進行中] 一覧編集UIの関係選択を People / Projects / Review 全体で選択UIにそろえる

## 未着手

- [未着手] Projects の一覧・詳細を feature component に分離する
- [未着手] Review の詳細編集を feature component に分離する
- [未着手] Playwright による主要 CRUD フローの E2E テストを追加する

## 完了

- [完了] Rust CI の `clippy::unnecessary_sort_by` 失敗を修正した
- [完了] ダッシュボード実体データをローカル保存層へ統合した
- [完了] Sessions / People / Projects / Review / Knowledge / Templates の追加・編集・削除を実装した
- [完了] import データと手入力データを同一保存層で扱うようにした
- [完了] Home を実データ集計で表示するようにした
- [完了] オーバーレイ設定画面を分割して責務整理した
- [完了] 関連人物 / 関連プロジェクト / 関連レビューの整合性正規化を追加した
- [完了] CI に frontend build / Rust fmt / clippy / check / build を追加した
- [完了] Sessions の詳細編集を専用コンポーネントへ分離した
- [完了] Sessions の関連人物 / 関連プロジェクト入力をチェック式の選択UIへ変更した
- [完了] workspace-store の生成 / 共通更新ロジックを helper 単位へ分割した

## 要確認

- [要確認] `workspace-seed.ts` はサンプルデータ定義ファイルとして 300 行超を許容するか、分割するか
- [要確認] People の `history` / `lastContactLabel` を将来的に完全導出へ寄せるか、手入力と併用するか

## 次回最初に着手するタスク

- [次回] `apps/desktop/src/features/dashboard/pages/projects-page.tsx` を一覧 / 詳細コンポーネントへ分割する
