# ADR 0001: ローカルOllama adapter

## 状態

採用

## 背景

How to Talkは個人情報を含む会話とナレッジを扱うため、既定で外部AIへ送信せず、端末内のLLMだけを利用する必要がある。推奨モデルは`gemma4:e2b`である。

## 課題

- Ollama未導入、停止中、モデル未取得を区別する。
- 約7.2GBのモデル取得を進捗表示・中止可能にする。
- LLMのJSON不正、timeout、停止時もセッションを継続する。
- WebViewへlocalhost接続権限を与えない。

## 選択肢

1. frontendからOllama APIへ直接接続する。
2. Ollama SDKを追加する。
3. Rustのrepository traitとHTTP adapterで接続する。

## 採用した案

Rust側に`LlmRepository`を定義し、`reqwest`を使う`OllamaClient`をinfrastructureへ置く。接続先は`http://127.0.0.1:11434`へ固定する。

## 採用理由

- frontendへOllama接続権限と会話本文を露出しない。
- 公式REST APIとの差分を明示できる。
- mock repositoryでretry・fallbackを単体テストできる。
- 将来の別ローカルruntimeへadapter単位で差し替えられる。

## メリット

- SSRFと任意remote host利用を防ぎやすい。
- model pullをNDJSON eventとしてUIへ通知できる。
- JSON Schema、入力上限、出力上限をRust側で強制できる。
- 失敗時に直前の有効cueを維持できる。

## デメリット

- Ollama本体とモデルの導入は別途必要。
- cold startでは5秒目標を超える可能性がある。
- HTTP API変更時はadapter更新が必要。

## 実装方針

- `GET /api/tags`で起動状態とモデル一覧を確認する。
- `POST /api/pull`はstreamを利用し、`CancellationToken`で中止する。
- `POST /api/generate`はJSON Schema、temperature 0、非stream、30秒timeoutを使う。
- JSON不正時だけ1回再試行し、それ以外は即時fallbackする。
- 会話入力は最大4,000文字、参照noteは最大8件・各2,000文字に制限する。
- モデルは5分keep-aliveし、cold start頻度を抑える。

## 将来的な見直し条件

- Ollamaが後方互換性のないAPI変更を行ったとき。
- より軽量で日本語品質が同等以上のローカルモデルが確認できたとき。
- 3 OSの実測で30秒timeoutやメモリ使用量が不適切だったとき。
