# Context Cue 実装計画 v0.1

## 1. この計画の位置づけ

この文書は、MVP を実装する順番、commit の切り方、テストの入れ方、レビュー単位を固定するための計画書である。

前提:

- Phase 0 は mock transcript を使う
- macOS を最優先にする
- OSS として読みやすさと contributor 参加性を重視する

## 2. 開発の進め方

基本方針は **横断実装ではなく縦切り実装** とする。

悪い進め方:

- UI だけ全部作る
- Rust だけ全部作る
- テストを最後にまとめる

良い進め方:

1. 1機能ごとに UI / command / service / test を揃える
2. mock で先に全体導線を閉じる
3. 次フェーズで adapter だけ差し替える

## 3. Phase 分割

### Phase 0A: リポジトリ初期化

目的:

- OSS として最低限の土台を先に作る

作業:

- pnpm workspace 作成
- Cargo workspace 作成
- Tauri + React + Vite 雛形作成
- Biome / Vitest / Playwright / Clippy / rustfmt 導入
- README / CONTRIBUTING / LICENSE / CODE_OF_CONDUCT / SECURITY 作成
- GitHub Actions の最小 CI 作成

完了条件:

- `pnpm lint`
- `pnpm test`
- `cargo test`
- `cargo clippy`
- `pnpm tauri build` または同等 build が通る

### Phase 0B: アプリシェル

目的:

- 画面の骨組みとウィンドウ責務を確定する

作業:

- Main Window 実装
- Overlay Window 実装
- Zustand store 初期化
- Tauri command / event の雛形
- LLM / STT / Session の接続状態表示

完了条件:

- main と overlay の 2 ウィンドウが起動する
- 画面上で idle 状態が確認できる

### Phase 0C: 同意確認とセッション制御

目的:

- 倫理要件を最初に通す

作業:

- consent checkbox UI
- `start_session` / `stop_session`
- consent audit ログ
- セッション状態遷移

完了条件:

- 同意未確認では開始不可
- 開始時に `REC / AI Assist Active / Consent Confirmed` を表示

### Phase 0D: mock transcript パイプライン

目的:

- 会話中支援の中核導線を先に成立させる

作業:

- mock audio / mock transcript source
- rolling transcript buffer
- rolling summary 生成
- frontend event 更新

完了条件:

- mock データで transcript と summary が数秒ごとに更新される

### Phase 0E: profile 読み込みと検索

目的:

- 個人文脈リコールの核を成立させる

作業:

- `profiles/sample/*.md` 読み込み
- markdown / text パーサ
- キーワード検索
- スコアリング
- related notes 表示

完了条件:

- transcript topic に応じて sample profile から関連メモを出せる

### Phase 0F: Ollama 連携と context cue 生成

目的:

- LLM による topic / intent / points 生成を成立させる

作業:

- ルールベース question detector
- Ollama 接続確認
- prompt builder
- Adaptive Inference Mode
- JSON parse / retry / fallback
- caution / questions / suggested points 表示

完了条件:

- JSON が正常なら overlay に反映される
- JSON が壊れてもアプリが落ちない
- 質問判定時のみ deep mode を起動できる

### Phase 0G: Share Safe Mode と設定保存

目的:

- 実運用での安全性を担保する

作業:

- Share Safe Mode UI
- global shortcut
- overlay hide / compact mode
- settings persistence
- save policy UI

完了条件:

- shortcut で mode 切替可能
- 再起動後に設定が復元される

### Phase 0H: 仕上げ

目的:

- OSS 公開可能な品質に揃える

作業:

- エラーハンドリング
- docs 整備
- サンプルプロフィール追加
- スクリーンショット / GIF
- issue / PR template

完了条件:

- 初見 contributor が README に沿って起動できる

## 4. commit の分け方

以下の粒度で commit を分ける。

### 4.1 初期セットアップ

1. `chore: initialize pnpm and cargo workspaces`
2. `chore: scaffold tauri desktop app with react and vite`
3. `chore: add biome vitest playwright and rust toolchain config`
4. `docs: add project policies and contributor documents`
5. `ci: add baseline github actions workflows`

### 4.2 機能実装

1. `feat: add app shell for main and overlay windows`
2. `feat: add consent gate and session lifecycle`
3. `feat: add mock transcript pipeline and rolling buffers`
4. `feat: add sample profile loader and keyword search`
5. `feat: add question detector and adaptive inference mode`
6. `feat: add ollama client and context cue generation`
7. `feat: add share safe mode and global shortcut`
8. `feat: add save policy and local settings persistence`

### 4.3 品質改善

1. `test: add rust service coverage for session and search`
2. `test: add frontend component coverage for consent and overlay`
3. `test: add playwright scenarios for mvp flows`
4. `refactor: extract core scoring and contracts crates`
5. `docs: finalize architecture setup and safety guidance`

## 5. Pull Request の単位

1 PR 1 目的を徹底する。

良い例:

- consent UI と開始ブロック
- mock transcript buffer 導入
- Ollama JSON retry 導入

悪い例:

- UI の見た目修正 + 検索改善 + CI 修正を同じ PR に入れる

目安:

- 変更ファイル数は 20 未満を推奨
- reviewer が 30 分以内で理解できる単位

## 6. 実装順の詳細

### 6.1 最初に確定させるインターフェース

以下は先に型を確定し、後で中身を差し替える。

- `SessionStatus`
- `SavePolicy`
- `TranscriptChunk`
- `RollingSummary`
- `ContextCue`
- `SttEngine`
- `LlmClient`
- `ProfileRepository`
- `QuestionDetector`

### 6.2 mock 優先で作るもの

- `MockSttEngine`
- `MockAudioSource`
- `MockContextCueFixture`
- `MockQuestionSignals`
- sample profiles

### 6.3 後で差し替えるもの

- STT 実装
- 検索実装
- Ollama model 名
- desktop E2E の詳細

## 7. テストライブラリと使い方

### 7.1 Frontend

ライブラリ:

- `Vitest`
- `React Testing Library`
- `@testing-library/user-event`
- `@tauri-apps/api/mocks`

方針:

- UI の見た目より挙動を検証する
- command 名、event 反映、disabled 状態、文言表示を重点確認する

代表ケース:

- 同意未チェック時に Start ボタンが動かない
- `mockIPC` で `start_session` の成功/失敗を再現できる
- `context-cue-updated` で overlay が更新される
- Share Safe Mode ON で本文が消える
- 質問判定が閾値未満なら deep mode が走らない
- 質問判定が閾値超過なら deep mode が走る

### 7.2 Rust

ライブラリ:

- 標準 `cargo test`
- `tokio::test`
- `insta` は必要になった時だけ導入

方針:

- 純ロジックはできるだけ core crate に寄せる
- Tauri 依存がない部分を厚くテストする
- 文字列一致より構造一致を優先する

代表ケース:

- save policy が保存可否を正しく判定する
- transcript buffer が 30 秒 / 3 分で切れる
- question detector が想定文で高スコアを返す
- 壊れた LLM JSON で retry に入る
- retry 失敗時に last good result を返す
- profile search のスコアが期待順になる

### 7.3 Playwright

対象:

- web UI の導線確認

方針:

- Tauri 実窓ではなく、まず web 側フローを担保する
- backend は mockIPC か fixture event で置き換える

代表ケース:

- アプリ起動時の idle 表示
- consent チェック後に session 開始 UI へ遷移
- summary / context cue の反映
- Share Safe Mode 切り替え

### 7.4 手動 smoke test

MVP では以下を release 前チェックリスト化する。

- macOS で main window が開く
- overlay が最前面表示される
- shortcut が動く
- Ollama 未起動時に警告が出る
- セッション停止後に discard が動く

## 8. CI 実行順

高速に落ちる順に実行する。

1. format / lint
2. typecheck
3. frontend unit test
4. rust unit / integration test
5. web flow test
6. desktop build

理由:

- contributor の待ち時間を減らす
- 失敗箇所を早く特定できる

## 9. ブランチ運用

- `main`: 常に起動可能
- 機能ブランチ: `feat/<short-name>`
- 修正ブランチ: `fix/<short-name>`
- ドキュメント: `docs/<short-name>`

rebase 運用でも merge 運用でもよいが、commit message は Conventional Commits に揃える。

## 10. Definition of Done

各タスクは以下を満たして完了とする。

- 実装が動く
- 型が通る
- 最低 1 つ自動テストがある
- エラー時の挙動が定義されている
- README または docs に反映されている

## 11. Phase 1 への移行条件

以下を満たしたら mock 中心の Phase 0 から Phase 1 へ進む。

- mock transcript で UX 検証が終わっている
- overlay の情報量が適正
- Ollama fallback が安定
- contributor がセットアップ可能
- MVP の主要導線に自動テストがある

## 12. 実装着手時の最初のタスク

着手順は固定でよい。

1. workspace とツールチェーンを作る
2. Tauri app を立ち上げる
3. main / overlay window を分ける
4. consent gate を入れる
5. mock transcript を流す
6. sample profile 検索を繋ぐ
7. Ollama を繋ぐ
8. Share Safe Mode を入れる
9. 保存ポリシーと docs を仕上げる
