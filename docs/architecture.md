# Context Cue アーキテクチャ設計 v0.1

## 1. 目的

この文書は、[requirements.md](/Users/nagaseibuki/Documents/context_cue/docs/requirements.md) を実装に落とすための技術設計の確定案である。

MVP の最優先は以下の 4 点とする。

- ローカルファースト
- 参加者同意を前提にした安全設計
- 会話中に邪魔しない軽量オーバーレイ
- Phase 0 から Phase 1 へ無理なく進化できる構成

## 2. 技術構成の決定

### 2.1 採用技術

| レイヤ | 採用 | 理由 |
| --- | --- | --- |
| デスクトップ基盤 | Tauri v2 | 軽量、Rust と相性が良い、権限管理と配布の土台がある |
| フロントエンド | React + TypeScript + Vite | Tauri と相性が良く、モック UI を高速に作れる |
| スタイル | React + CSS Modules ではなく、現状は `globals.css` ベースの手書き CSS | オーバーレイと高密度ダッシュボードをピクセル単位で調整しやすい |
| UI 状態管理 | Zustand | グローバル状態が小さく、Tauri IPC と組み合わせやすい |
| バリデーション | Zod | LLM JSON、設定、コマンド入出力の検証に使う |
| Rust バックエンド | Rust stable | 音声処理、ファイル検索、保存制御、Tauri コマンドを集約する |
| 保存設定 | Zustand persist + Rust ローカルファイル保存 | UI 設定と実データを責務分離して永続化できる |
| グローバルショートカット | Tauri Global Shortcut plugin | Share Safe Mode の即時切り替えに必要 |
| ファイルアクセス | 原則 Rust 側で実装 | 個人メモ・保存制御を frontend に直接持たせないため |
| LLM 接続 | Ollama HTTP API | ローカル LLM 前提に最も自然 |
| STT 抽象 | Rust trait で差し替え | Phase 0 は mock、Phase 1 で whisper.cpp へ移行しやすくする |

### 2.2 採用しないもの

- Next.js
  - Tauri デスクトップ単体アプリの MVP では過剰。SSR も不要。
- Electron
  - ローカル常駐・軽量オーバーレイ要件と相性が悪い。
- フロントエンドからの広範なファイルシステムアクセス
  - 個人メモやログ保存の制御を分散させるとプライバシー設計が崩れる。
- 早い段階での embeddings / ベクタ DB
  - MVP はキーワード検索で十分。検索品質の改善は Phase 2 で行う。

## 3. アーキテクチャ方針

### 3.1 全体像

```txt
React UI
  ↓ invoke / event listen
Tauri command layer
  ↓
Application services
  ├─ consent
  ├─ session
  ├─ transcript
  ├─ summarizer
  ├─ profile_search
  ├─ llm_client
  └─ persistence
       ↓
Local resources
  ├─ microphone / mock source
  ├─ Ollama
  ├─ local profile files
  └─ local session/config files
```

### 3.2 責務分離

#### Frontend の責務

- 画面表示
- オーバーレイ表示と Share Safe Mode の視覚制御
- ユーザー操作の受付
- Rust コマンド呼び出し
- Rust イベント購読
- UI 向けの軽い整形
- Overlay Settings / 下書き UI のローカル永続化

#### Rust の責務

- セッション状態の正本管理
- 同意確認状態の検証
- 音声入力と STT 抽象
- transcript buffer 管理
- rolling summary 生成
- プロファイル検索
- Ollama 通信
- 保存ポリシー適用
- ファイル I/O
- エラー制御と再試行
- 個人ナレッジと share-safe 状態のローカル永続化

### 3.3 設計原則

- UI は薄く、状態の正本は Rust に置く
- LLM 出力は必ず schema で検証する
- 個人メモの読み書きは frontend に直接持たせない
- 保存の有無は機能ごとではなくポリシーで制御する
- セッション中データと永続データを明確に分離する

## 4. リポジトリ構成

MVP 時点の推奨構成は以下とする。

```txt
context-cue/
  apps/
    desktop/
      index.html
      package.json
      vite.config.ts
      tsconfig.json
      src/
        main.tsx
        App.tsx
        styles/
          globals.css
        components/
          ui/
          layout/
        features/
          app-shell/
          consent/
          session-control/
          transcript/
          summary/
          profile-selection/
          profile-search/
          overlay/
          share-safe-mode/
          settings/
          llm-status/
        lib/
          tauri/
            commands.ts
            events.ts
          schemas/
            consent.ts
            llm.ts
            session.ts
            settings.ts
          state/
            app-store.ts
          utils/
        test/
          setup.ts
          fixtures/
      src-tauri/
        Cargo.toml
        build.rs
        tauri.conf.json
        capabilities/
          default.json
        src/
          main.rs
          lib.rs
          commands/
            mod.rs
            consent.rs
            session.rs
            settings.rs
            profile.rs
            overlay.rs
          state/
            mod.rs
            app_state.rs
          errors/
            mod.rs
            app_error.rs
          models/
            mod.rs
            consent.rs
            llm.rs
            session.rs
            transcript.rs
            settings.rs
          services/
            mod.rs
            consent_service.rs
            session_service.rs
            transcript_service.rs
            summary_service.rs
            profile_service.rs
            llm_service.rs
            persistence_service.rs
            overlay_service.rs
          adapters/
            mod.rs
            audio/
              mod.rs
              mock_audio_source.rs
            stt/
              mod.rs
              engine.rs
              mock_stt.rs
            llm/
              mod.rs
              ollama_client.rs
            storage/
              mod.rs
              profile_repository.rs
              session_repository.rs
      tests/
        e2e-web/
  crates/
    context-cue-core/
      Cargo.toml
      src/
        lib.rs
        scoring.rs
        text.rs
    context-cue-contracts/
      Cargo.toml
      src/
        lib.rs
  profiles/
    sample/
      values.md
      projects.md
      meetings.md
      todos.md
      experiences.md
  docs/
    requirements.md
    architecture.md
    implementation-plan.md
    ethics.md
    consent.md
    screen-share-safety.md
  .github/
    workflows/
  Cargo.toml
  package.json
  pnpm-workspace.yaml
  biome.json
  README.md
  LICENSE
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
```

## 5. ワークスペース構成

### 5.1 JavaScript ワークスペース

ルートに `pnpm-workspace.yaml` を置き、まずは `apps/*` のみを管理する。

理由:

- 将来 `docs site` や `playground` を追加しやすい
- OSS として contributor が構造を理解しやすい

### 5.2 Rust ワークスペース

ルートに `Cargo.toml` を置き、`apps/desktop/src-tauri` と `crates/*` を workspace member にする。

理由:

- Cargo workspace により Tauri 本体と検索ロジックなどの共有 crate を分離できる
- 音声処理や検索ロジックを単体テストしやすい

## 6. データ配置

実データはリポジトリ内ではなく、Tauri のアプリ用ディレクトリに保存する。

### 6.1 論理ディレクトリ

```txt
AppConfig/
  settings.json
  consent-audit.log

AppLocalData/
  profiles/
  sessions/
  cache/

AppLog/
  app.log
  error.log
```

### 6.2 保存ポリシー

- 音声: デフォルト保存しない
- transcript: 保存 OFF 時はメモリのみ
- rolling summary: 保存 OFF 時はメモリのみ
- AI 出力: 保存 OFF 時はメモリのみ
- consent audit: 会話本文を含めず保存してよい

### 6.3 例外

開発時のみ、リポジトリ配下の `profiles/sample` を seed data として利用する。

本番利用では、ユーザーの個人ナレッジはアプリ上で明示的に追加されたものだけを対象とする。

ホームディレクトリ全体や汎用フォルダ全体を自動走査する設計は採らない。

## 7. ドメインモデル

### 7.1 中核エンティティ

#### Session

- `id`
- `status`: idle / running / stopping / completed / failed
- `started_at`
- `ended_at`
- `profile_id`
- `consent_confirmed`
- `share_safe_mode`
- `save_policy`

#### TranscriptChunk

- `id`
- `session_id`
- `source`
- `text`
- `started_at`
- `ended_at`
- `confidence`

#### RollingSummary

- `current_topic`
- `important_points`
- `open_questions`
- `generated_at`

#### ContextCue

- `topic`
- `intent`
- `related_notes`
- `suggested_points`
- `questions_to_ask`
- `caution`
- `generated_at`

#### ProfileDocument

- `path`
- `title`
- `tags`
- `content`
- `updated_at`
- `source_type`: imported / linked

#### SavePolicy

- `save_audio`
- `save_transcript`
- `save_summary`
- `save_ai_output`
- `discard_after_session`

## 8. Rust モジュール設計

### 8.1 `commands/`

frontend から呼ぶ入口。ここには複雑な業務ロジックを置かない。

想定コマンド:

- `start_session`
- `stop_session`
- `get_app_state`
- `import_profile_documents`
- `remove_profile_document`
- `clear_profile_documents`
- `select_profile_directory`
- `load_profiles`
- `toggle_share_safe_mode`
- `update_save_policy`
- `check_ollama_status`
- `generate_context_cue`
- `clear_session_memory`

### 8.2 `services/`

機能ごとのユースケースを持つ。

- `consent_service`
  - セッション開始条件の検証
- `session_service`
  - 状態遷移
- `transcript_service`
  - chunk 追加、rolling buffer 更新
- `summary_service`
  - transcript から rolling summary を生成
- `profile_service`
  - 明示追加された profile 読み込みと検索
- `llm_service`
  - Ollama 呼び出し、再試行、JSON 検証
- `persistence_service`
  - 保存ポリシーに従った書き込み
- `overlay_service`
  - overlay 向け表示 DTO の短文化

### 8.3 `adapters/`

外部依存を隔離する。

- `audio`
- `stt`
- `llm`
- `storage`

この構成により、Phase 0 の mock 実装を残したまま Phase 1 の実実装を追加できる。

なお storage adapter は最小権限を原則とし、ユーザーが明示的に選択したファイルまたはフォルダだけを扱う。

## 9. Frontend 設計

### 9.1 画面構成

MVP の画面は 2 系統に分ける。

- Main Window
  - 設定、状態、セッション制御、個人ナレッジ管理
- Overlay Window
  - 常時最前面、最小情報、短文化表示

### 9.2 なぜウィンドウを分けるか

- メイン画面の設定 UI とオーバーレイ UI の責務が違う
- Share Safe Mode で overlay のみを即時隠しやすい
- 将来的にオーバーレイの表示位置固定や透過設定を独立して扱える

### 9.3 state 設計

Zustand の store は 1 つにまとめすぎず、少なくとも次に分割する。

- `useSessionStore`
- `useOverlayStore`
- `useSettingsStore`
- `useConnectionStore`

ただし正本は Rust であり、frontend store は UI キャッシュとして扱う。

### 9.4 schema

LLM 出力、設定、セッション状態はすべて Zod で parse する。

特に以下は parse 必須。

- Rust command response
- Rust event payload
- LLM JSON output
- persisted settings

## 10. イベント設計

Tauri event で frontend に push する。

### 10.1 想定イベント

- `session-status-changed`
- `transcript-updated`
- `rolling-summary-updated`
- `context-cue-updated`
- `question-score-updated`
- `share-safe-mode-changed`
- `ollama-status-changed`
- `stt-status-changed`
- `error-raised`

### 10.2 イベント利用方針

- polling は最小限にする
- transcript と summary は push 駆動
- UI はイベント受信後に store を更新する

## 11. 検索設計

### 11.1 Phase 0 / 1

まずはファイルごとのキーワード検索を行う。

スコア例:

- title 完全一致: +10
- title 部分一致: +6
- tag 一致: +5
- 本文出現回数: +1 ずつ
- 最近更新ファイル: 補正 +1

### 11.2 検索対象

- `values.md`
- `projects.md`
- `meetings.md`
- `todos.md`
- `experiences.md`

MVP では検索対象を「アプリに明示追加されたドキュメント」に限定する。

外部フォルダリンク機能を導入する場合も、そのフォルダはユーザーが選択したものに限る。

### 11.3 検索入力

- recent transcript
- rolling summary の current topic
- open questions

### 11.4 Adaptive Inference 連携

検索は毎回最大強度で走らせない。

light mode では以下のみを使う。

- recent transcript のキーワード
- rolling summary の current topic

deep mode では以下を追加する。

- question detector の結果
- detected intent hint
- 直近の重要語

deep mode への切り替え条件:

- question score が閾値を超える
- confirmation / request が検出される
- 話題転換が検出される
- 定期更新タイミングに達する

### 11.5 将来拡張

- SQLite FTS
- embeddings
- hybrid search
- file watch による再インデックス

## 12. LLM 設計

### 12.1 処理フロー

```txt
recent transcript
 + rolling summary
 + question likelihood
 + intent hint
 + retrieved notes
↓
prompt build
↓
Ollama request
↓
raw text response
↓
JSON extraction
↓
Zod validation
↓
overlay DTO shortening
```

### 12.2 再試行ポリシー

- 1 回目失敗: JSON 抽出失敗
- 2 回目: 「JSON only」強化 prompt で再試行
- 3 回目失敗: 前回有効結果を維持し warning 表示

### 12.3 Adaptive Inference Mode

LLM は常時実行しない。

MVP の推論モードは以下の 2 段階とする。

- light mode
  - transcript 更新
  - rolling summary 更新
  - ルールベース質問判定
  - 軽量キーワード抽出
- deep mode
  - profile search の強化
  - Ollama 呼び出し
  - context cue 更新

deep mode の起動条件:

- question score が閾値を超える
- `ですか` `ますか` `どう` `なぜ` `いつ` `どれ` `確認したい` などのルールに一致する
- 確認依頼や意思決定に関わる発話が検出される
- 話題転換が検出される
- 最終 deep mode 実行から一定時間が経過する

この方針により、リアルタイム性を transcript 系で担保しつつ、重い推論は必要時のみ実行する。

### 12.4 タイムアウト

- 接続タイムアウト
- 応答タイムアウト
- キャンセル可能なリクエスト

### 12.5 ガードレール

- 回答代筆を促す prompt を入れない
- stealth / covert 用途を禁止する方針を system prompt に含める
- `related_notes` が空でも正常系として扱う
- ユーザーが許可していない個人ドキュメントを LLM 入力に含めない

## 13. オーバーレイ設計

### 13.1 表示ルール

- 1 行の情報量を制限する
- topic / intent / caution は折り返さず truncation
- notes / points / questions は件数上限を固定
- REC と consent 状態を常時表示する
- deep mode が走っていない間は前回の有効結果を維持する

### 13.2 Share Safe Mode

ON 時の挙動:

- overlay 本文を非表示
- small badge のみ残す
- ショートカットで一時表示
- stealth mode ではない文言を明示

### 13.3 プラットフォーム注意

画面共有への映り込み防止はベストエフォート。特に macOS では完全保証を前提にしない。

## 14. セキュリティと権限

Tauri v2 では、危険な plugin command はデフォルトで blocked であり、capabilities で明示的に許可する形を前提にする。

この方針に合わせ、以下を採る。

- plugin 権限は最小付与
- frontend に不要な fs 権限を渡さない
- shell 実行は Phase 0 では使わない
- profile 読み込みは明示的選択ディレクトリのみ許可
- ログには transcript 本文を含めない
- 個人ナレッジは明示インポート型を標準とし、無差別な自動走査を禁止する
- 個人ナレッジ削除時は索引・キャッシュも削除対象に含める

## 15. テスト戦略

### 15.1 テストレイヤ

#### Rust unit test

対象:

- 状態遷移
- transcript buffer
- scoring
- summary 生成の整形
- save policy
- error mapping

#### Rust integration test

対象:

- service 間連携
- mock STT から context cue 生成まで
- profile 読み込みから検索まで

#### Frontend unit / component test

ライブラリ:

- Vitest
- React Testing Library
- `@tauri-apps/api/mocks`

対象:

- consent UI
- overlay の短文化表示
- Share Safe Mode 切り替え
- invoke command の呼び出し
- event 受信時の store 更新

#### Web UI flow test

ライブラリ:

- Playwright

対象:

- Phase 0 の main UI 導線
- consent を満たさないと開始できない
- mock event に応じて UI が更新される

#### Desktop smoke test

対象:

- macOS で Tauri アプリ起動
- overlay 表示
- shortcut 動作
- Ollama 未起動警告

### 15.2 macOS の E2E 制約

Tauri の WebDriver ベース E2E は macOS desktop では制約があるため、MVP では以下の戦略を採る。

- CI では Rust test + frontend test + Playwright web flow を主軸にする
- macOS 固有の Tauri 挙動は smoke test を補助的に行う
- Linux CI を追加した段階で desktop E2E を増やす

### 15.3 カバレッジ目標

- Rust core crates: lines 85% 以上
- frontend features: lines 80% 以上
- 主要導線の Playwright シナリオ: 100%

## 16. CI 方針

最初の GitHub Actions は以下の jobs に分ける。

- `lint-js`
- `typecheck-js`
- `test-js`
- `fmt-rust`
- `clippy-rust`
- `test-rust`
- `build-desktop-macos`

Phase 0 では release までは自動化しなくてよいが、PR で壊れないことを先に担保する。

## 17. リスクと先回り

### 17.1 最大リスク

- STT と overlay 遅延の両立
- macOS の画面共有制御
- Ollama 応答の JSON 破損
- 個人メモ検索精度不足

### 17.2 先回り策

- Phase 0 は mock transcript で UX を先に確定
- LLM 出力は schema validate 前提
- profile search は pure Rust crate に分離
- Share Safe Mode は「完全秘匿」ではなく「誤露出低減」と明記

## 18. MVP の完了条件

以下を満たしたら Phase 0 完了とする。

- 同意確認なしではセッション開始できない
- mock transcript から rolling summary が更新される
- 質問判定に応じて deep mode が起動する
- sample profile から関連メモを引ける
- Ollama から JSON を受け、壊れていても graceful fallback できる
- overlay が短文化された情報を表示できる
- Share Safe Mode をショートカットで切り替えられる
- 保存 OFF の場合、セッションデータを終了時に破棄できる
