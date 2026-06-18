# Context Cue 要件定義書 v0.1

## 1. プロダクト概要

### 1.1 名称

仮称: **Context Cue**

### 1.2 一文説明

Context Cue は、参加者の同意を得た会議・面談・1on1・メンタリング等の会話音声をリアルタイムに文字起こしし、ユーザーのメモ・資料・過去ログから、今の会話に必要な情報を画面上部に提示するローカルファースト OSS である。

### 1.3 目的

会話中に、ユーザーが以下を自然に思い出せるようにする。

- 過去に話した内容
- 関連する自分のメモ
- 関連する資料
- 前回の決定事項
- 未完了タスク
- 今確認すべき論点
- 次に話すべき構成

本ツールは、回答の代筆・無断録音・隠れた文字起こしを目的としない。

## 2. 背景

既存の AI 会議ツールは、主に会議後の議事録、要約、アクションアイテム生成に強い。一方で、会議中に「今この話題なら、自分の過去メモのどれを思い出すべきか」を提示する用途にはまだ余地がある。

特に、以下のような課題がある。

- 会話中に過去の決定事項をすぐ思い出せない
- 前回面談・前回会議の内容を探す時間がない
- 自分のメモはあるが、会話中に引けない
- AI 議事録は会議後には便利だが、会話中の発言支援には弱い
- クラウド AI に会話内容を送ることに抵抗がある
- 画面共有中に個人メモや文字起こしが映るリスクがある

Context Cue は、会議後の記録ではなく、**会話中の文脈リコール**に焦点を当てる。

## 3. 新規性

### 3.1 既存との差分

Context Cue の新規性は、単なる文字起こしや議事録生成ではなく、**会話中の相手発話をトリガーにして、個人ナレッジから関連情報をリアルタイムに呼び出すオーバーレイ**である点にある。

既存ツールの多くは以下の流れである。

```txt
会話音声
↓
文字起こし
↓
要約
↓
議事録・アクションアイテム
```

Context Cue は以下の流れを重視する。

```txt
会話音声
↓
現在トピック・質問意図の抽出
↓
個人メモ・資料・過去ログの検索
↓
今話すべき情報・確認すべき論点の提示
```

### 3.2 コアコンセプト

**Conversation-Aware Personal Recall**

日本語では、**会話文脈に応じた自己情報・資料リコール**である。

### 3.3 研究・開発上の位置づけ

Context Cue は、AI 議事録ツール、個人ナレッジ管理、ローカル LLM、オーバーレイ UI を組み合わせた実用ツールである。

ただし、新規性を主張する場合は「ローカル議事録」では弱い。ローカル議事録は既存 OSS があるため、以下を差別化軸とする。

- 会議後ではなく会議中に使う
- 汎用要約ではなく個人文脈に基づくリコール
- 議事録生成ではなく発言・確認・想起の補助
- 画面上部の軽量オーバーレイ
- 参加者同意を前提にした倫理設計
- 画面共有時の誤表示防止モード

## 4. 優位性

### 4.1 ユーザー価値

#### 会話中に探す時間を減らせる

会議中に過去メモ、資料、前回ログを探す必要が減る。

#### 発言の質が上がる

現在の話題に対して、関連する事実・論点・確認事項をすぐ出せる。

#### 会議後だけでなく会議中に価値が出る

多くの AI 議事録は会議後に価値が出るが、Context Cue は会議中の発言・確認・意思決定を支援する。

#### ローカルファーストで安心感がある

音声、文字起こし、要約、個人メモを可能な限りローカルで扱う。

#### 画面共有時の事故を減らせる

Share Safe Mode により、個人メモや文字起こしが画面共有に映り込むリスクを減らす。

## 5. 想定ユーザー

### 5.1 メインユーザー

- 学生
- 就活生
- エンジニア
- 研究室メンバー
- 個人開発者
- 1on1 を受ける人
- 面談・相談が多い人
- 会議中に過去情報を参照したい人

### 5.2 利用シーン

- 会議
- 面談
- 1on1
- メンタリング
- 模擬面接
- キャリア相談
- 研究打ち合わせ
- 顧客ヒアリング
- OSS 開発ミーティング

## 6. 非目的

本ツールは以下を目的としない。

- 無断録音
- 隠れた文字起こし
- 相手に知らせない AI 補助
- 回答の代筆
- 本人の発言能力の置き換え
- 常時監視
- すべての会話の自動保存
- クラウドへの無断送信

## 7. 倫理・同意要件

### 7.1 起動前確認

セッション開始前に、以下の確認を必須とする。

```txt
□ 参加者全員から、文字起こし・要約・AI補助の利用許可を得ています
□ このツールを、相手に隠れて回答を代行する目的では使用しません
□ Share Safe Modeは、画面共有時の誤表示防止のために使用します
```

すべてにチェックしない限り、録音・文字起こし・AI 補助を開始できない。

### 7.2 REC 表示

セッション中はアプリ内に以下を常時表示する。

```txt
REC / AI Assist Active / Consent Confirmed
```

### 7.3 Share Safe Mode の文言

Share Safe Mode 使用時には以下の文言を表示する。

```txt
Share Safe Mode is not a stealth mode.
This feature is designed to prevent accidental exposure of personal notes, transcripts, and private context during screen sharing.
Before using it, you must confirm that all conversation participants have agreed to transcription and AI assistance.
```

日本語表示は以下とする。

```txt
Share Safe Modeは、相手に隠れて使用するための機能ではありません。
この機能は、画面共有中に個人メモ・文字起こし・プライベートな文脈情報が誤って映り込むことを防ぐためのものです。
使用前に、会話の参加者全員が文字起こしおよびAI補助の利用に同意していることを確認してください。
```

### 7.4 ログ保存ポリシー

デフォルトでは音声ファイルを保存しない。

文字起こしログ、要約ログ、AI 出力ログはユーザーが明示的に保存 ON にした場合のみ保存する。

### 7.5 クラウド送信

デフォルトではクラウド送信を OFF にする。

外部 API を使う場合は、ユーザーが明示的に ON にし、送信対象を確認できる必要がある。

## 8. 機能要件

### 8.1 MVP 機能

#### F-01 セッション開始・停止

ユーザーは Start/Stop ボタンでセッションを開始・停止できる。開始前には同意確認チェックが必須。

#### F-02 マイク音声入力

MVP ではマイク入力を取得する。

将来的にシステム音声、会議アプリ音声、仮想オーディオデバイスへの対応を検討する。

#### F-03 リアルタイム文字起こし

音声を数秒単位で文字起こしする。

MVP では mock STT でもよい。実装段階で `Whisper.cpp` または `faster-whisper` に差し替え可能なインターフェースを用意する。

#### F-04 Rolling Transcript Buffer

直近の文字起こしをバッファとして保持する。

初期値は以下とする。

- short buffer: 直近 30 秒
- medium buffer: 直近 3 分
- session buffer: セッション全体。ただし保存 OFF の場合はメモリ上のみ

#### F-05 Rolling Summary

直近 3 分程度の会話を短く要約する。

出力例:

```json
{
  "current_topic": "前回決定した仕様の確認",
  "important_points": ["API仕様の変更", "期限の再確認"],
  "open_questions": ["担当者が未確定"]
}
```

#### F-06 個人ナレッジ読み込み

ユーザーはローカルフォルダに Markdown またはテキストファイルを配置できる。

初期構成:

```txt
profiles/
  sample/
    values.md
    projects.md
    meetings.md
    todos.md
    experiences.md
```

#### F-07 個人ナレッジ検索

現在の会話トピック、質問、キーワードから関連する個人メモを検索する。

MVP ではキーワード検索でよい。

将来的に以下を追加する。

- SQLite FTS
- embeddings
- hybrid search
- ファイル更新監視

#### F-08 LLM による提示内容生成

Gemma4 E2B を Ollama 経由で呼び出し、以下の JSON を生成する。

```json
{
  "topic": "現在の話題",
  "intent": "相手が確認したそうなこと",
  "related_notes": ["関連する自分のメモ"],
  "suggested_points": ["今話すとよさそうな要点"],
  "questions_to_ask": ["確認すべき質問"],
  "caution": "避けるべきこと"
}
```

LLM は常時高頻度で呼び出さない。

MVP では、質問・確認・依頼・話題転換などのトリガーを検出したとき、または一定間隔ごとにのみ呼び出す。

この制御により、ローカル実行時の負荷を抑えつつ、会話中に必要な場面でのみ提示内容を更新する。

#### F-08a Adaptive Inference Mode

推論負荷を抑えるため、アプリは軽量処理と重い推論処理を分離する。

軽量処理:

- マイク入力
- リアルタイム文字起こし
- rolling transcript buffer 更新
- 軽量キーワード抽出
- 軽量な質問・確認・依頼判定

重い処理:

- 関連メモ検索の強化
- LLM による意図推定
- LLM による context cue 生成

重い処理は以下の条件で優先的に実行する。

- 相手発話が質問と推定されたとき
- 確認依頼や意思決定に関わる発話と推定されたとき
- 話題転換が検出されたとき
- 一定時間が経過したとき

MVP では、質問判定はルールベースでよい。

#### F-09 オーバーレイ表示

画面上部に常時前面の半透明オーバーレイを表示する。

表示内容:

- 現在の話題
- 相手の意図
- 関連メモ
- 話すべき要点
- 確認すべき質問
- 注意点

#### F-10 表示の短文化

オーバーレイには長文を表示しない。

1 画面あたり最大表示量:

- topic: 1 行
- intent: 1 行
- related notes: 最大 3 件
- suggested points: 最大 5 件
- questions: 最大 3 件
- caution: 1 行

#### F-11 Share Safe Mode

画面共有時の誤表示を防ぐためのモード。

機能:

- オーバーレイ非表示
- 小型アイコン化
- ショートカットで一時表示
- Share Safe Mode 使用前の確認モーダル
- 「stealth mode ではない」文言表示

#### F-12 セッション後サマリー

セッション終了後に以下を生成する。

```json
{
  "summary": "会話全体の要約",
  "decisions": ["決定事項"],
  "todos": ["TODO"],
  "follow_up_questions": ["次回確認すべきこと"],
  "related_notes_used": ["参照されたメモ"]
}
```

#### F-13 保存設定

ユーザーは以下を選択できる。

- 音声保存: デフォルト OFF
- 文字起こし保存: デフォルト OFF
- 要約保存: デフォルト ON/OFF を選択可能
- AI 出力保存: デフォルト OFF
- セッション後にすべて破棄

## 9. 非機能要件

### 9.1 ローカルファースト

基本処理はローカルで完結する。

- STT: ローカル
- LLM: Ollama ローカル
- 個人メモ: ローカルファイル
- 保存: ローカル

### 9.2 プライバシー

- 外部送信はデフォルト OFF
- 保存は明示的許可制
- 音声ファイルはデフォルト保存しない
- セッション終了時にメモリ上の一時データを破棄できる

### 9.3 レイテンシ

MVP 目標:

- 文字起こし遅延: 3〜8 秒以内
- オーバーレイ更新: 10〜20 秒ごと
- LLM 応答: 5 秒以内を目標
- UI 操作: 即時反応

Adaptive Inference Mode 有効時は、軽量な transcript 更新は高頻度で継続し、LLM を伴う overlay 更新は質問・確認・話題転換の検出時または一定間隔で行う。

### 9.4 安定性

- LLM 出力が JSON として壊れた場合は再試行する
- 再試行しても失敗した場合は、前回の有効出力を表示する
- 音声認識に失敗してもアプリ全体は落とさない
- Ollama 未起動時は警告を出す

### 9.5 クロスプラットフォーム

MVP 優先順位:

1. macOS
2. Windows
3. Linux

### 9.6 画面共有安全性

画面共有への映り込み防止はベストエフォートとする。

特に macOS では、OS や会議ツールの仕様により、オーバーレイ除外を完全保証できない場合がある。

そのため以下を推奨する。

- 画面全体共有ではなく、特定ウィンドウ共有を推奨
- Share Safe Mode を明示的に ON にする
- 画面共有中はオーバーレイを非表示にする
- キャプチャ除外 API は補助的に使う

## 10. 技術構成

### 10.1 デスクトップアプリ

候補:

- Tauri v2
- React
- TypeScript
- Rust backend

理由:

- Rust と相性が良い
- 軽量
- ローカルアプリに向く
- 将来的に音声処理やファイル検索を Rust で書ける

### 10.2 音声処理

MVP:

- mock STT
- マイク入力

次段階:

- whisper.cpp
- faster-whisper
- システム音声入力
- 仮想オーディオデバイス連携

### 10.3 LLM

MVP:

- Ollama
- Gemma4 E2B

LLM の役割:

- 現在トピック抽出
- 意図分類
- 関連メモの要約
- 提示すべき要点生成
- セッション後サマリー生成

LLM に任せないもの:

- 音声認識
- ファイル管理
- 検索本体
- 保存制御
- 同意管理
- UI 制御

MVP では、LLM は常時呼び出しではなくイベント駆動で利用する。

具体的には、質問判定、確認依頼判定、話題転換検出、または定期更新タイミングでのみ利用する。

### 10.4 個人ナレッジ検索

MVP:

- Markdown ファイル
- キーワード検索
- 簡易スコアリング

次段階:

- SQLite FTS
- embeddings
- semantic search
- hybrid search

### 10.5 データ保存

初期構成:

```txt
context-cue/
  profiles/
  sessions/
  config/
  logs/
```

保存設定:

- profiles: ユーザー管理
- sessions: 保存 ON の場合のみ
- config: アプリ設定
- logs: エラー・同意確認ログ。会話内容は含めない

## 11. 画面仕様

### 11.1 メイン画面

要素:

- Start/Stop ボタン
- 同意確認チェック
- 使用するプロフィールフォルダ選択
- LLM 接続状態
- STT 接続状態
- 保存設定
- Share Safe Mode 切り替え

### 11.2 オーバーレイ

表示例:

```txt
┌──────────────────────────────────────────────┐
│ REC / AI Assist Active / Consent Confirmed    │
│ Topic: 前回仕様の確認                         │
│ Intent: 決定事項と未決事項の整理              │
│ Notes: API仕様メモ / 前回議事録 / TODO        │
│ Points: 期限確認・担当確認・影響範囲確認      │
│ Ask: この変更は今回リリース対象ですか？       │
└──────────────────────────────────────────────┘
```

### 11.3 Share Safe Mode 中

表示:

```txt
Share Safe Mode ON
Overlay hidden to prevent accidental exposure during screen sharing.
This is not stealth mode. Consent is required.
```

ショートカット:

- macOS: `Command + Shift + Space`
- Windows: `Ctrl + Shift + Space`

## 12. LLM プロンプト仕様

### 12.1 System Prompt

```txt
You are a local conversation context assistant.

Your role is to help the user recall relevant personal notes, documents, and past context during a consent-based conversation.

You do not write full answers for the user.
You do not impersonate the user.
You do not encourage covert recording or hidden AI assistance.

Return concise JSON only.
Use Japanese when the transcript is Japanese.
Do not invent facts.
If the provided notes do not contain relevant information, return an empty array for related_notes.
```

### 12.2 Input

```json
{
  "transcript_recent": "...",
  "rolling_summary": "...",
  "question_likelihood": 0.0,
  "detected_intent_hint": "question | confirmation | request | discussion",
  "retrieved_notes": [
    {
      "title": "前回議事録",
      "content": "..."
    }
  ],
  "mode": "meeting"
}
```

### 12.3 Output

```json
{
  "topic": "string",
  "intent": "string",
  "related_notes": ["string"],
  "suggested_points": ["string"],
  "questions_to_ask": ["string"],
  "caution": "string"
}
```

## 13. 評価指標

### 13.1 MVP 評価

- 文字起こしからオーバーレイ更新までの遅延
- 関連メモの検索精度
- LLM JSON 成功率
- 質問判定の妥当性
- 不要な LLM 呼び出しを抑えられているか
- 画面の邪魔にならなさ
- Share Safe Mode の分かりやすさ
- ユーザーが会話中に情報を思い出せた回数

### 13.2 定量目標

初期目標:

- JSON 出力成功率: 90% 以上
- オーバーレイ更新成功率: 95% 以上
- 1 回の表示文字数: 300 字以内
- LLM 応答失敗時のアプリクラッシュ: 0
- セッション開始時の同意確認通過率: 100%
- デフォルト音声保存: OFF

### 13.3 比較評価

比較対象:

- 普通のメモ
- AI 議事録ツール
- 事前カンペ
- 手動検索
- Context Cue

評価観点:

- 会話中に必要情報を出せたか
- 会話の邪魔にならなかったか
- 個人情報が安全に扱われたか
- 会議後の整理が楽になったか
- 画面共有中に安心して使えたか

## 14. MVP 開発スコープ

### 14.1 Phase 0: モック版

目的: UI と全体体験を確認する。

実装:

- Tauri + React 雛形
- 上部オーバーレイ
- mock transcript
- mock rolling summary
- ルールベース質問判定
- `profiles/sample/*.md` 読み込み
- キーワード検索
- Ollama 接続
- JSON 表示
- 同意確認 UI
- Share Safe Mode UI
- README
- `docs/ethics.md`

### 14.2 Phase 1: ローカル STT 版

目的: 実音声から動く状態にする。

実装:

- マイク入力
- whisper.cpp 連携
- transcript buffer
- rolling summary
- セッション後サマリー

### 14.3 Phase 2: 検索強化

目的: 個人ナレッジ検索の精度を上げる。

実装:

- SQLite FTS
- ファイルインデックス
- タイトル/本文/タグ検索
- 関連度スコア表示

### 14.4 Phase 3: 実用化

目的: 会議で使いやすくする。

実装:

- ショートカット
- ウィンドウ位置固定
- 表示カスタム
- 保存ポリシー詳細化
- エクスポート
- 複数プロフィール
- 会議種別モード

## 15. リポジトリ構成案

```txt
context-cue/
  apps/
    desktop/
      src/
      src-tauri/
  crates/
    audio/
    stt/
    transcript/
    summarizer/
    profile_search/
    llm_client/
    consent/
  profiles/
    sample/
      values.md
      projects.md
      meetings.md
      todos.md
  docs/
    ethics.md
    consent.md
    screen-share-safety.md
    architecture.md
  README.md
  LICENSE
```

## 16. README 冒頭案

```txt
# Context Cue

Context Cue is a local-first assistive overlay for consent-based conversations.

It helps users recall relevant notes, documents, and past context during meetings, mentoring sessions, interviews, and 1on1s where all participants have agreed to transcription and AI assistance.

It is not designed for covert recording, hidden transcription, or answer outsourcing.
```

日本語:

```txt
Context Cueは、参加者の同意を得た会話で利用する、ローカルファーストの支援オーバーレイです。

会議・面談・メンタリング・1on1・面接練習などで、ユーザーが自分のメモ・資料・過去情報を会話文脈に応じて思い出すことを支援します。

無断録音、隠れた文字起こし、回答の代行を目的としたツールではありません。
```
