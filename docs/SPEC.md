# How to Talk / Context Cue 製品仕様書

- 仕様バージョン: 1.0.0-draft
- 対象アプリバージョン: 0.1.x
- 更新日: 2026-07-28
- ステータス: 開発中
- 正本: `docs/SPEC.md`

## 1. 文書の目的

この文書は、How to Talk（内部識別子: Context Cue）の現在の製品仕様を、利用者、開発者、コントリビューターが同じ基準で確認するための正本である。

要件の背景は `docs/requirements.md`、技術判断は `docs/architecture.md` と `docs/adr/`、公開準備状況は `docs/TODO.md` を参照する。本書は「現在どのように振る舞うべきか」を定義する。

## 2. 製品定義

How to Talkは、参加者の同意を得た会議、面談、1on1、メンタリングなどの会話をローカルで文字起こしし、利用者が登録した情報と照合して、会話中に思い出すべき要点や確認事項を表示するデスクトップアプリである。

中核価値は次の3点である。

- 会話の現在地を短く整理する
- 自分のナレッジから関連情報を思い出しやすくする
- 次に話す候補や確認事項を、回答代行にならない粒度で提示する

本製品は無断録音、隠れた文字起こし、試験や面接での不正な回答代行、常時監視を目的としない。

## 3. 対象プラットフォーム

- macOS
- Windows
- Linux

デスクトップ基盤はTauri v2、UIはReactとTypeScript、ローカル処理はRustを使用する。配布版はOS別インストーラをGitHub Releasesから提供する想定である。

## 4. 起動モード

### 4.1 新規

`new`は本人用保存領域を空の状態から開始する。既存データがある場合は退避してから新しいワークスペースを作成する。

### 4.2 再開

`resume`は本人用保存領域から前回のデータを復元する。配布版とモード未指定時の既定値である。

### 4.3 デモ

`demo`は画面確認用のシードデータを使用する。本人用データとは別の保存領域を使い、デモ内容を本人用領域へ混入させない。

## 5. 画面仕様

### 5.1 Home

保存済み実データを集計し、準備状況、当日の予定、次に見る項目、最近のセッションを表示する。データがない場合は件数を0として表示し、デモ記録を補完しない。

### 5.2 Sessions

会話セッションの一覧、検索、種別フィルタ、追加、詳細編集、削除を提供する。人物、プロジェクト、振り返りとの関連を保持する。

### 5.3 People

会話相手の一覧、検索、分類、追加、詳細編集、削除を提供する。プロフィール、メモ、次回確認事項、関連セッションを扱う。

### 5.4 Projects / Companies

企業またはプロジェクトの一覧、検索、分類、追加、詳細編集、削除を提供する。概要、重要点、関連セッション、アクション、進捗を扱う。

### 5.5 My Knowledge

本人の基礎情報、経験、強み、注意事項、ローカルMarkdownまたはテキスト資料を管理する。手入力とファイル取り込みは同じ保存層で扱う。

秘密鍵、パスワード、本人確認番号、不要な第三者情報は入力しないよう画面内で案内する。各項目は出典、確度、機密度を持てる。

### 5.6 Templates

会話前ブリーフ、確認質問、議事メモ、1on1、グループディスカッション、振り返りなどのテンプレートを管理する。標準テンプレートも通常データとして編集・削除でき、削除後に勝手に再生成しない。

### 5.7 Review

終了したセッションの要約、文字起こし、良かった点、改善点、学び、次のアクションを管理する。保存ポリシーで許可された情報だけを記録する。

### 5.8 Overlay Settings

オーバーレイの位置、寸法、文字サイズ、透明度、テーマ、表示セクション、保存ポリシー、ローカルAI、ローカル音声認識、同意確認、データ書き出し・削除を扱う。

### 5.9 Documentation

本仕様書をアプリ内でオフライン閲覧できる。章一覧、全文検索、仕様バージョンと更新日を表示する。表示内容は `docs/SPEC.md` から生成し、CIで同期を検査する。

## 6. オーバーレイ仕様

### 6.1 上部オーバーレイ

現在の話題、要点、次に話す候補、確認したいことを表示する。独立した常前面ウィンドウとして、他アプリへ移動しても表示を維持できる。

### 6.2 右側オーバーレイ

文字起こしと要約メモを表示する。上部オーバーレイとは別に表示・非表示を切り替えられる。

### 6.3 表示条件

原則としてセッション実行中のみ会話支援内容を表示する。停止中はサンプル会話や固定回答を表示しない。

### 6.4 Share Safe Mode

画面共有中の個人メモや文字起こしの誤表示を防ぐため、オーバーレイ本文を即時に遮蔽する。これはステルス利用のための機能ではなく、参加者同意を代替しない。

## 7. セッション処理

処理の基本順序は次のとおりである。

1. 利用者が参加者全員の同意を確認する
2. マイク入力を取得する
3. VADで発話区間を抽出する
4. whisper.cppで日本語を逐次文字起こしする
5. 質問らしさと現在トピックを判定する
6. 許可されたMy Knowledgeを検索する
7. 必要な場合だけOllamaのローカルLLMへ構造化生成を依頼する
8. JSON Schema検証済みの候補をオーバーレイへ反映する
9. 停止時に保存ポリシーを適用し、許可された内容からReviewを作る
10. 保存しない一時データをメモリから破棄する

質問判定で不要な推論を抑え、LLM停止時は直前の有効なcueまたはルールベース表示へ劣化する。

## 8. ローカルAI仕様

### 8.1 LLM

OllamaをローカルLLM実行基盤として使用する。推奨モデルは `gemma4:e2b` である。Ollama本体とモデルはアプリへ同梱せず、状態検出と取得進捗をアプリ内で案内する。

### 8.2 構造化出力

LLM出力は型付きJSON Schemaで検証する。入力上限、timeout、cancel、1回のretry、直前cueへのfallbackを持つ。検証前の文字列をUIや保存データの正本として扱わない。

### 8.3 STT

whisper.cppと量子化済みWhisperモデルを使用する。モデルの取得、ハッシュ照合、状態確認、中止をアプリから行える。生音声は保存しない。

## 9. データモデル

ワークスペースは次のコレクションを持つ。

- Sessions
- People
- Projects / Companies
- Reviews
- My Knowledge
- Templates
- Template Library Version

各レコードは安定したIDを持つ。関連IDが削除された場合は正規化処理で孤立参照を除去する。外部ファイルから取り込んだKnowledgeと手入力Knowledgeは同じコレクションへ保存する。

## 10. 保存とプライバシー

### 10.1 保存場所

本人用とデモ用は別のアプリデータ領域へ保存する。ダッシュボード実データの正本はRust側ローカル保存とし、WebViewキャッシュへ重複保存しない。

### 10.2 ファイル保護

保存ファイルは所有者のみ読み書きできる権限を設定し、一時ファイルへの書込み、同期、renameによる原子的更新を行う。schema version、入力サイズ上限、バックアップ世代上限、破損時復旧を持つ。

### 10.3 保存ポリシー

- 生音声: 常に保存しない
- 文字起こし: 既定OFF
- 要約: 既定OFF
- AI出力: 既定OFF
- My Knowledge: 利用者が明示的に追加した内容だけ保存

全保存OFFの場合、会話本文から推定したトピックをタイトルや種別へ残さない。

### 10.4 データ制御

利用者は全データをJSONで書き出せる。全削除ではworkspace、backup、一時ファイルを削除する。ログへ会話本文、個人ナレッジ、秘密情報を出力しない。

## 11. 同意と安全要件

セッション開始には次の3項目すべての確認を必須とする。

- 参加者全員が文字起こし、要約、AI補助に同意している
- 回答代行や不正利用を目的としない
- Share Safe Modeは誤表示防止として使用する

同意記録にはセッションID、確認時刻、ポリシー版だけを保存し、会話本文を含めない。セッションごとに再確認する。

## 12. エラー処理

利用者入力、保存、IPC、音声認識、LLM、モデル取得、ファイル取込みの失敗を区別する。利用者には再試行可能な短いメッセージを表示し、内部詳細やファイル内容を露出しない。

LLMまたはSTTが利用できなくても、編集済みローカルデータの閲覧と管理は継続できる。

## 13. CLI仕様

### 13.1 製品仕様の参照

リポジトリのルートで次を実行できる。

```sh
corepack pnpm spec
corepack pnpm spec -- --list
corepack pnpm spec -- --section "保存とプライバシー"
corepack pnpm spec -- --json
corepack pnpm spec:check
```

既定では仕様全文を標準出力へ表示する。`--list`は章一覧、`--section`は一致する章、`--json`は機械可読形式を出力する。存在しない章の指定は終了コード2とする。

`spec:check`は正本とアプリ同梱データのハッシュを比較し、不一致なら失敗する。

インストール済みのRust CLIでは、同じ正本を次のコマンドで取得できる。

```sh
how-to-talk spec
```

### 13.2 AI Agent向けデータ操作

`how-to-talk`は、本人用ローカルworkspaceをAI Agentから安全にCRUDする。対象リソースは次の6種類である。

| CLI名 | 保存キー | 内容 |
| --- | --- | --- |
| `sessions` | `sessions` | 面談、会議、1on1などのセッション |
| `people` | `people` | 会話相手と関係情報 |
| `projects` | `projects` | 企業、プロジェクト、課題 |
| `reviews` | `reviews` | セッション後の振り返り |
| `knowledge` | `knowledgeItems` | 本人の知識、経験、注意事項 |
| `templates` | `templates` | 準備、会話、振り返りのテンプレート |

```sh
how-to-talk path
how-to-talk list sessions
how-to-talk get sessions SESSION_ID
how-to-talk create knowledge --file ./knowledge.json
printf '%s' '{"title":"stdin入力"}' | how-to-talk create knowledge --data -
how-to-talk update knowledge KNOWLEDGE_ID --data '{"confidence":"確認済み"}'
how-to-talk delete knowledge KNOWLEDGE_ID
how-to-talk schema
how-to-talk schema knowledge
how-to-talk schema knowledge --operation create
how-to-talk schema knowledge --operation update
how-to-talk schema knowledge --operation response
how-to-talk schema knowledge --operation list-response
```

`--data-dir DIR`で保存ディレクトリを明示できる。`--demo`はデモ専用領域を選ぶ。両方の同時指定はできない。

エージェントは書込み前に `how-to-talk --version`、`how-to-talk spec`、対象リソースの操作別Schemaを確認する。SPEC `1.0.0-draft` はCLI `0.1.x` と互換であり、操作別Schemaの `x-cli-version` と `x-spec-version` が実行中バイナリの契約を示す。

### 13.3 入出力契約

標準出力は常にJSONとする。成功時は `{"ok":true,"data":...}`、失敗時は標準エラーへ `{"ok":false,"error":{"code":"...","message":"..."}}` を出力する。

| 終了コード | 意味 |
| --- | --- |
| `0` | 成功 |
| `1` | I/O、保存、内部エラー |
| `2` | JSONまたは型が不正 |
| `3` | 対象なし、またはworkspace使用中 |

`create`は省略項目へ安全な初期値を設定してIDを自動生成する。省略可能項目と実際の既定値は `schema <resource> --operation create` の各プロパティにある `default` を正本とする。`update`はトップレベルの部分更新とし、配列やネスト値は項目単位で置換する。変更可能項目は `--operation update` で取得し、IDの変更、空の更新、未知フィールド、型不一致、不正なworkspace構造は保存前に拒否する。

`get`、`create`、`update`、`delete`の成功時 `data` は完全な1レコードである。`delete`の場合は削除されたレコードを返す。これらの成功・失敗envelopeは `schema <resource> --operation response`、`list`の配列envelopeは `--operation list-response` で取得できる。エラーSchemaは `code` の列挙と `x-error-exit-codes` による終了コード対応を含む。

日時項目は現時点では表示用文字列であり、厳密な日時形式を強制しない。`startAt`にはISO 8601形式を推奨する。Schemaに `minLength` がない文字列は空文字を許可し、配列には個別の件数上限を設けない。ただし、1コレクション最大10,000件、workspace入力全体最大10MiB、Knowledgeの `avatarDataUrl` はJPEG・PNG・WebPのdata URLかつ800KB以下とする。

関連レコードを削除した場合はSessionsの孤立参照を除去し、Projectsの関連セッション数と一覧をSessionsから再計算する。

### 13.4 排他制御と安全性

デスクトップアプリは起動中にworkspaceの排他ロックを保持する。CLIの参照操作は許可するが、追加、編集、削除は `workspace_in_use` で拒否する。変更時はデスクトップアプリを終了する。

CLI引数はシェル履歴へ残るため、個人情報を含む入力には `--file` または `--data -` を使う。APIキー、秘密鍵、パスワード、本人確認番号はKnowledgeにも保存しない。AI Agentには必要なリソースだけを読み書きさせ、実行ログへ本文を残さない設定を推奨する。

正式な保存済みデータSchemaは `docs/schemas/agent-cli.schema.json` とする。全Schemaは `how-to-talk schema`、リソース単位では `how-to-talk schema <resource>` で取得できる。作成入力、部分更新入力、1件レスポンス、一覧レスポンスはそれぞれ `--operation create`、`update`、`response`、`list-response` を指定し、推測でpayloadを組み立てない。

## 14. 品質要件

- TypeScriptで `any` を使用しない
- Rustで `unwrap` / `expect` を通常処理に使用しない
- 1ファイル300行以内を原則とする
- UI、状態、永続化、外部処理の責務を分離する
- lint、typecheck、unit test、buildをCIで実行する
- Rustはfmt、clippy、check、test、buildをCIで実行する
- JavaScriptとRustの依存脆弱性監査をCIで実行する
- モバイル相当の狭いウィンドウでも操作不能にしない
- キーボード操作と可読性を継続的に監査する

## 15. 現在の制約

- macOS署名・公証とWindows署名は未完了
- 3 OSの配布物インストールsmoke testは未完了
- セッションごとの参照Knowledge選択は未完了
- Overlay Settingsの一部設定はOS実動作への接続が未完了
- 主要CRUDのPlaywright E2Eは未完了
- 保存・LLM・STTの障害系integration testは拡充が必要
- 自動更新、SBOM、正式なrollback運用は未完了

未完了項目を実装済みとしてUIやREADMEへ記載しない。最新状態は `docs/TODO.md` を正とする。

## 16. リリース受け入れ条件

製品版として公開する前に、少なくとも次を満たす。

- 全P0タスク完了
- モックなしの連続セッションを完走
- 保存OFF時に音声・文字起こし・AI本文が残存しない
- Share Safe Modeで本文露出がない
- データ書き出し、全削除、破損復旧を実行できる
- CIと依存監査が成功する
- macOS、Windows、Linuxで配布物を実機確認する
- 署名、公証、プライバシー、安全利用文書を整備する

## 17. 仕様変更ルール

挙動を変更する実装では、本書とテストを同じ変更単位で更新する。長期的な技術判断はADRへ記録する。

正本を更新した後は次を実行する。

```sh
corepack pnpm spec:generate
corepack pnpm spec:check
```

生成ファイルを直接編集してはならない。
