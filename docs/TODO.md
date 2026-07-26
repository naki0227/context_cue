# TODO

## 進行中

- なし

## P0: 本番ブロッカー

- [未着手] マイク入力、権限、デバイス選択、VADを実装する
- [未着手] whisper.cpp adapterと日本語リアルタイムSTTを実装する
- [未着手] Ollama検出、起動状態、モデル一覧を実データ化する
- [未着手] `gemma4:e2b`取得進捗を表示する初回セットアップを実装する
- [未着手] LLM prompt、JSON schema、timeout、cancel、retry、fallbackを実装する
- [完了] Consentをセッション単位にし、本文なしの同意監査記録を追加する
- [完了] Share Safe Modeでoverlay本文を確実に非表示にする
- [完了] 空のoverlayからハードコードされた面接会話を削除する
- [未着手] 保存ファイルを`0600`、原子的書込み、schema version付きにする
- [未着手] Rust側workspace schema検証と入力サイズ上限を追加する
- [未着手] backup保持上限、全データ削除、export、破損復旧を実装する
- [未着手] 音声、transcript、summary、AI出力の保存ポリシーを実装する
- [未着手] セッション終了後summaryとReview生成を実データへ接続する
- [未着手] mainとoverlayのTauri capabilityを分離し、CSPを設定する
- [未着手] 正式アイコン、macOS署名・公証、Windows署名を設定する
- [未着手] 3 OSで初回Releaseとインストールsmoke testを実施する

## P1: 公開前必須

- [未着手] User基本情報とMy Knowledge onboardingを実装する
- [未着手] AI整理前preview、差分承認、出典・確度・機密度を実装する
- [未着手] セッションごとの参照ナレッジ選択を実装する
- [未着手] 設定画面の表示位置、hotkey、起動時最小化を実動作へ接続する
- [未着手] 保存・IPC・overlay・event失敗のエラーUIと再試行を実装する
- [未着手] 個人情報を除外する構造化ログと診断情報exportを実装する
- [未着手] Playwright による主要 CRUD フローの E2E テストを追加する
- [未着手] LLM / STT / persistence / migrationのintegration testを追加する
- [未着手] coverage閾値とSBOM生成をCIへ追加する
- [未着手] PRIVACY、ethics、consent、screen-share safety文書を追加する
- [未着手] Tauri Updater、CHANGELOG、rollback手順を整備する
- [未着手] `use-dashboard-controller.ts` を責務別hookへ分割して300行以内にする

## P2: 公開後改善

- [未着手] SQLite migrationと全文検索へ移行する
- [未着手] speaker diarizationとシステム音声入力を追加する
- [未着手] 実機性能に基づくモデル自動選択を追加する
- [未着手] アクセシビリティとキーボード操作を監査する
- [未着手] 多言語化、timezone、日時形式を正規化する

## 完了

- [完了] 本番リリース準備を監査し、P0 / P1 / P2の受け入れ条件を文書化した
- [完了] My Knowledge入力例、禁止情報、AI整理promptを文書化した
- [完了] pnpm audit / cargo-auditをCIへ追加し、Dependabotを有効化した
- [完了] PostCSS、esbuild、quick-xmlの既知脆弱性を修正版へ更新した
- [完了] Consentを非永続化し、セッションID・確認時刻・ポリシー版だけを監査記録にした
- [完了] Share Safe Mode専用遮蔽UIと安全なoverlay空状態を実装した
- [完了] 新規・再開・デモの3起動を追加し、本人用領域は新規/再開で共有、デモだけ分離した
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

- [次回] 保存ファイルの`0600`化、原子的書込み、エラー伝播を実装する
- [次回] OllamaセットアップとLLM clientのADR・interface・テストを作る
