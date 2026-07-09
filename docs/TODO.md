# TODO

## 進行中

- [進行中] Playwright による主要 CRUD フローの E2E テスト追加を準備する

## 未着手

- [未着手] Playwright による主要 CRUD フローの E2E テストを追加する

## 完了

- [完了] 全ダッシュボード画面を作業ツール寄りの UI 密度・文言・背景に調整した
- [完了] 共通 RelationSelector を追加し、Sessions / Projects / Review の関係編集 UI を選択式にそろえた
- [完了] Review の一覧・詳細を feature component に分離した
- [完了] Projects の一覧・詳細を feature component に分離した
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

- [次回] Playwright で主要 CRUD と relation 編集の E2E テストを追加する
