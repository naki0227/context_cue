# 本番リリース準備監査

## 結論

2026年07月26日時点では、本番リリース不可。

ダッシュボード、CRUD、デモ、ローカルJSON保存、オーバーレイ外形は動作する。
一方、製品価値の中核である実音声入力、STT、Ollama連携、LLM生成はモックである。
安全機能にも表示だけで実動作へ接続されていない項目がある。

## 監査した範囲

- 要件、アーキテクチャ、実装計画、TODO
- React画面、状態管理、Tauri IPC、Rust usecase、保存処理
- CI、Release workflow、署名・配布設定
- ローカル保存ファイルと権限
- 自動テストと本番バンドル
- この端末のOllamaと`gemma4:e2b`

## 現在動くもの

| 領域 | 状態 |
| --- | --- |
| Dashboard | Homeと6種類のデータ画面を表示できる |
| CRUD | Sessions / People / Projects / Review / Knowledge / Templatesを編集できる |
| 保存 | Rust側ローカルJSONへ保存できる |
| 起動 | new / resume / demoを分離済み |
| Knowledge import | `.md` / `.txt`を明示選択して追加・削除できる |
| Overlay | 上部・右側の別ウィンドウを表示・リサイズできる |
| Consent gate | 3項目が揃わないと開始できない |
| Question detector | ルールベース判定とキーワード検索がある |
| CI | JSとRustのlint / typecheck / test / buildが通る |
| Bundle | ローカルで`.app`と`.dmg`を生成できる |

## P0: 本番公開を止める項目

### 1. 実音声・STTがない

現状は`MockEventRunner`が固定4文を2秒間隔で流す。マイク列挙、権限要求、
デバイス選択、録音、VAD、STT、話者区別、切断復旧は未実装。

完了条件:

- macOS / Windowsでマイク権限を説明して取得できる
- 入力デバイスを選択し、レベルメーターを確認できる
- ローカルSTTで日本語を逐次文字起こしできる
- 目標端末で遅延、CPU、メモリ、精度を計測できる
- マイク切断・権限拒否・STT失敗でもアプリが落ちない
- 音声を保存しないことをテストで保証する

### 2. Ollama・LLMが接続されていない

`ollamaReady`は常に`true`。HTTP client、モデル検出、pull、生成、構造化出力、
timeout、cancel、retry、last-good fallbackがない。提示文も固定値である。

この端末ではOllama `0.30.7`と`gemma4:e2b`が存在し、モデル容量は7.2GB。
実行中モデルはなかった。

完了条件:

- `/api/version`とモデル一覧で実状態を表示する
- Ollama未導入、停止中、モデル未取得を区別する
- アプリ内セットアップからモデル取得進捗を表示する
- 利用前に必要ディスク・推定メモリ・モデルライセンスを表示する
- JSON schema検証、最大2回の再試行、timeout、cancelを実装する
- LLM停止時はルールベース表示へ劣化し、セッションを継続できる
- 実会話fixtureでJSON成功率、応答時間、捏造率を評価する

推奨する導入方式:

1. 初回起動でOllamaを自動検出する
2. 未導入ならOS別の公式インストーラへの導線を表示する
3. 導入後はアプリが再検出する
4. `POST /api/pull`を使い、`gemma4:e2b`の取得進捗と中断・再開を表示する
5. 短い自己診断promptで速度とJSON適合を確認する

MVPではOllama本体と7.2GBモデルをアプリへ同梱しない。配布物肥大化、更新責務、
OS/GPU差、モデル利用条件への対応が重くなるためである。将来同梱する場合は、
モデルのライセンス・Notice・禁止用途・再配布条件を別途法務確認する。

参考:

- https://docs.ollama.com/api/pull
- https://docs.ollama.com/macos
- https://docs.ollama.com/windows
- https://ollama.com/library/gemma4/tags
- https://ai.google.dev/gemma/docs/core/model_card_4

### 3. ConsentとShare Safe Modeが要件を満たさない

- Consent値がブラウザ保存され、次セッションにも残る
- セッションごとの同意確認記録がない
- Share Safe ModeをONにしてもオーバーレイ本文は隠れない
- 使用前確認モーダルと「stealth modeではない」説明がない
- 画面共有検出はなく、`hideOnScreenShare`は保存されるだけ
- REC / AI Assist Active / Consent Confirmedの常時表示がない
- transcriptが空の右オーバーレイに面接例文が表示される

完了条件:

- Consentはセッション単位で毎回未確認へ戻す
- 本文を含めない同意監査記録を残す
- Share Safe Modeで本文を即時非表示にする
- 画面共有自動検出を保証できない場合は、その制約をUIで明示する
- 空状態ではサンプル会話を表示しない
- セッション中は録音・文字起こし・AI状態を常時表示する

### 4. 個人データ保存が本番水準ではない

保存JSONとバックアップは平文で、実機では`0644`だった。書込みは直接上書きで、
失敗を呼び出し元へ返さない。schema version、migration、破損復旧、排他制御、
保持期間、バックアップ世代上限、完全削除、エクスポートもない。

さらにRustは`dashboard_state: Value`をそのまま受け、backend schema検証をしない。
CSPは`null`で、mainとoverlayが同じcapabilityを持ち、overlayからも変更系IPCへ
到達できる構成である。

完了条件:

- 保存ファイルとバックアップを所有者のみ読める`0600`にする
- temp書込み、fsync、renameによる原子的保存を行う
- 保存失敗をUIへ通知し、再試行できる
- schema versionとmigration、破損時の復元UIを設ける
- バックアップ保持数と削除UIを設ける
- 「全データ削除」で本文、索引、cache、backupを削除する
- Rust側でも型付きschemaとサイズ上限を検証する
- mainとoverlayのcapabilityを分け、変更系IPCをmainだけへ許可する
- CSPを設定し、不要なTauri plugin権限を削る
- 端末暗号化を推奨し、必要ならOS keychain / Strongholdを検討する

### 5. 保存ポリシーとセッション終了処理がない

要件にある音声、transcript、summary、AI出力の保存選択と
`discard_after_session`が実装されていない。セッション後summary、決定事項、
TODO、フォローアップ生成もない。

完了条件:

- 保存対象ごとの明示設定と安全な初期値を実装する
- セッション停止時にメモリ破棄または保存確認を行う
- 保存OFFをintegration testで保証する
- Reviewは実セッション結果から生成し、保存前に編集できる

### 6. 配布の信頼性がない

タグ、GitHub Release、Release workflow実績は0件。`.dmg`は生成できるが、
macOS署名はad-hocでTeam IDなし、公証なし。Windows署名も未設定。
アイコンは1x1透明PNG。自動更新、checksum公開、SBOM、rollback手順もない。

完了条件:

- 正式アイコンとOS別アイコンセットを用意する
- macOS署名・notarization、Windows署名を設定する
- 3 OSでRelease workflowを実行し、実機インストールする
- checksumとSBOMをReleaseへ添付する
- Tauri Updaterを署名付きで導入する
- バージョン、変更履歴、rollback、サポート対象OSを明記する

参考:

- https://v2.tauri.app/distribute/
- https://v2.tauri.app/plugin/updater/

## P1: 公開前に必要な品質

### My KnowledgeとUser設定

- 初回オンボーディングとUser基本情報ページがない
- 入力例、テンプレート、機密度、利用目的の説明がない
- どの情報が今回LLMへ渡るか確認できない
- 第三者情報、秘密情報、不要なセンシティブ情報への注意がない
- AI整理promptと、捏造を防ぐ確認フローがない

具体案は[My Knowledge入力ガイド](./my-knowledge-guide.md)に定義する。

### エラー・ログ・復旧

- 多数の`.catch(() => undefined)`と`let _ =`で失敗を握り潰している
- 保存、overlay、event失敗をユーザーが認識できない
- 構造化ログ、個人情報redaction、診断情報exportがない
- `Mutex::lock().expect(...)`によりpoison時にpanicする
- crash recoveryとsingle-instance制御がない

### 設定の実動作

表示位置、画面共有時非表示、起動時最小化、hotkey、言語、未読強調、
transcript維持、自動保存OFFは保存されるだけで実動作へ接続されていない。
表示順のドラッグ&ドロップ説明もあるが実装されていない。

### テスト

- Playwright依存はあるが設定・E2Eテスト・CI実行がない
- Tauri command、保存失敗、migration、LLM、STTのintegration testがない
- macOS/Windows/Linuxのinstall smoke testがない
- coverage計測と閾値がない
- dependency audit、Dependabot/Renovate、SBOM生成がない
- `pnpm audit`は応答デコードエラー、`cargo audit`は未導入で未確認

## P2: 公開後の改善

- SQLiteとmigrationへ移行し、全文検索と整合性を強化する
- session別に参照ナレッジを選択できるようにする
- speaker diarizationとシステム音声入力を追加する
- 実機性能データからモデル自動選択を行う
- アクセシビリティ、キーボード操作、aria-live、色コントラストを監査する
- 匿名・明示opt-inの品質指標収集を検討する
- 多言語化、時刻・日付・timezoneの正規化を行う

## 推奨実装順

1. Consent / Share Safe Mode / 空表示 / 保存権限を先に直す
2. LLMセットアップ画面とOllama clientを実装する
3. User基本情報とMy Knowledge onboardingを実装する
4. マイク / VAD / whisper.cpp adapterを実装する
5. rolling buffer / summary / context cueを実データへ接続する
6. 保存ポリシー、終了後Review、完全削除を実装する
7. E2E、障害系、性能、3 OS smoke testを追加する
8. 署名、公証、Updater、初回Releaseを行う

## リリース判定ゲート

以下がすべて満たされるまで「製品版」と表示しない。

- モックなしで10回の30分セッションを完走する
- STT p95遅延8秒以内、cue p95更新20秒以内
- LLM JSON成功率95%以上、失敗時クラッシュ0
- 保存OFF時の音声・transcript残存0
- Share Safe Mode試験で本文露出0
- 全P0項目完了
- 3 OS CIと実機smoke test成功
- 署名済み配布物とprivacy文書を公開
- データ削除・export・破損復旧を手順通り実行できる
