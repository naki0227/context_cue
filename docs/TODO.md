# TODO

## 進行中

- [進行中] AI整理前previewと差分承認を実装する

## P0: 本番ブロッカー

- [完了] マイク入力、権限、デバイス選択、VADを実装する
- [完了] whisper.cpp adapterと日本語リアルタイムSTTを実装する
- [完了] Ollama検出、起動状態、モデル一覧を実データ化する
- [完了] `gemma4:e2b`取得進捗を表示する初回セットアップを実装する
- [完了] LLM prompt、JSON schema、timeout、cancel、retry、fallbackを実装する
- [完了] Consentをセッション単位にし、本文なしの同意監査記録を追加する
- [完了] Share Safe Modeでoverlay本文を確実に非表示にする
- [完了] 空のoverlayからハードコードされた面接会話を削除する
- [完了] 保存ファイルを`0600`、原子的書込み、schema version付きにする
- [完了] Rust側workspace schema検証と入力サイズ上限を追加する
- [完了] 全データ削除とユーザー指定先へのexportを実装する
- [完了] 音声、transcript、summary、AI出力の保存ポリシーを実装する
- [完了] セッション終了後summaryとReview生成を実データへ接続する
- [完了] mainとoverlayのTauri capabilityを分離し、CSPを設定する
- [完了] 正式アプリアイコンを設定する
- [未着手] macOS署名・公証、Windows署名を設定する
- [未着手] 3 OSで初回Releaseとインストールsmoke testを実施する

## P1: 公開前必須

- [未着手] ReleaseへOS別CLIバイナリを添付し、インストールsmoke testを追加する
- [未着手] `globals.css`を共通要素と画面単位へ分割し、300行方針へ近づける
- [完了] User基本情報とMy Knowledge onboardingを実装する
- [進行中] AI整理前previewと差分承認を実装する
- [完了] Knowledgeへ出典・確度・機密度を追加する
- [未着手] セッションごとの参照ナレッジ選択を実装する
- [未着手] 設定画面の表示位置、hotkey、起動時最小化を実動作へ接続する
- [進行中] 保存・IPC・overlay・event失敗のエラーUIと再試行を実装する
- [未着手] 個人情報を除外する構造化ログと診断情報exportを実装する
- [未着手] Playwright による主要 CRUD フローの E2E テストを追加する
- [未着手] LLM / STT / persistence / migrationのintegration testを追加する
- [未着手] coverage閾値とSBOM生成をCIへ追加する
- [未着手] GitHub ActionsをNode.js 24対応版へ更新し、非推奨警告を解消する
- [未着手] PRIVACY、ethics、consent、screen-share safety文書を追加する
- [未着手] Tauri Updater、CHANGELOG、rollback手順を整備する
- [完了] `use-dashboard-controller.ts` を責務別hookへ分割して300行以内にする

## P2: 公開後改善

- [未着手] SQLite migrationと全文検索へ移行する
- [未着手] speaker diarizationとシステム音声入力を追加する
- [未着手] 実機性能に基づくモデル自動選択を追加する
- [未着手] アクセシビリティとキーボード操作を監査する
- [未着手] 多言語化、timezone、日時形式を正規化する

## 完了

- [完了] AI Agent向けCLIでSessions / People / Projects / Reviews / Knowledge / TemplatesのCRUDを実装した
- [完了] GUIとCLIのローカル保存処理を共通crateへ集約し、同時書込みの排他制御を追加した
- [完了] `docs/SPEC.md`を正本としてアプリ内検索・CLI全文・JSON Schemaから参照できるようにした
- [完了] 全ダッシュボードの上余白を広げ、People / Projects / Templates / Reviewのタブを見出し行から分離した
- [完了] 本人用ワークスペースへ編集・削除可能な標準テンプレート6件を一度だけ導入するマイグレーションを追加した
- [完了] My Knowledgeの未定義補助ボタンを共通角丸デザインへ統一し、個人名を入力例とテストから削除した
- [完了] TypeScript 7で削除された`baseUrl`を除去し、Dependabot PRの型検査失敗を修正した
- [完了] 本人用ワークスペースでプロフィール画像の設定・変更・削除・サイドバー表示を実装した
- [完了] 人物画像を使わない正式アプリアイコンを生成し、各OS向け素材とTauri bundle設定へ反映した
- [完了] Knowledge項目へ出典・確度・機密度を追加し、既存データ互換を維持した
- [完了] Knowledge詳細編集を専用コンポーネントへ分離した
- [完了] 実Whisper文字起こしを質問検出とローカルLLM提案の共通パイプラインへ接続した
- [完了] セッション停止後に遅れて完了したSTT・LLM結果を破棄するようにした
- [完了] User基礎情報を既存Knowledge保存層へ統合し、Homeとサイドバーへ反映した
- [完了] My Knowledgeへ入力例、禁止情報の注意、AI整理promptの閲覧・コピーを追加した
- [完了] 保存項目を既定OFFにし、選択した文字起こし・要約・AI出力だけをReviewへ保存するようにした
- [完了] 全保存OFF時は推定トピックを含む会話本文をタイトルや種別にも残さないようにした
- [完了] セッション停止時にRustメモリ上の文字起こし・要約・提案を消去するようにした
- [完了] 本人用モードでデモイベントが混入しないようにした
- [完了] Rust 1.97で追加されたClippy lintに対応し、依存監査を含むCIを復旧した
- [完了] 本番リリース準備を監査し、P0 / P1 / P2の受け入れ条件を文書化した
- [完了] My Knowledge入力例、禁止情報、AI整理promptを文書化した
- [完了] pnpm audit / cargo-auditをCIへ追加し、Dependabotを有効化した
- [完了] PostCSS、esbuild、quick-xmlの既知脆弱性を修正版へ更新した
- [完了] Consentを非永続化し、セッションID・確認時刻・ポリシー版だけを監査記録にした
- [完了] Share Safe Mode専用遮蔽UIと安全なoverlay空状態を実装した
- [完了] workspaceを0600・原子的書込み・10MiB上限・schema検証付きへ変更した
- [完了] backupを5件に制限し、破損時の自動復旧を追加した
- [完了] 保存失敗のエラー表示と250ms遅延保存を追加した
- [完了] 全データのJSON書き出しと、workspace・backup・一時ファイルの完全削除を追加した
- [完了] main/overlayのTauri capabilityを分離し、WebViewのCSPを設定した
- [完了] macOS release buildで`.app`とDMGの生成を確認した
- [完了] Ollama状態確認、モデル一覧、`gemma4:e2b`取得進捗・中止を設定画面へ接続した
- [完了] 質問検出時のLLM生成、JSON Schema、入力上限、1回retry、直前cue fallbackを実装した
- [完了] 実`gemma4:e2b`で構造化出力smoke testを実施した
- [完了] マイク入力、16kHz変換、VAD、入力デバイス選択を実装した
- [完了] 公式Whisper base q5_1の取得・検証・日本語推論を実装した
- [完了] 実WhisperモデルのSHA-1照合と推論smoke testを実施した
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

- [要確認] `cargo audit`の許可済み警告18件をTauri更新に合わせて定期的に再評価する
- [要確認] `workspace-seed.ts` はサンプルデータ定義ファイルとして 300 行超を許容するか、分割するか
- [要確認] People の `history` / `lastContactLabel` を将来的に完全導出へ寄せるか、手入力と併用するか

## 次回最初に着手するタスク

- [次回] My KnowledgeのAI整理preview・差分承認・メタデータを実装する
- [次回] セッションごとの参照Knowledge選択を実装する
