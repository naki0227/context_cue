# 本番リリース準備監査

## 監査日時

2026年07月28日

## 結論

本番リリース不可。アプリの主要なローカル機能とCIは動作するが、署名・公証、
3 OS実機インストール、SBOM、公開用Git identity、主要E2Eが未完了である。

Release workflowはdraft成果物を作る準備段階まで進んでいる。必須項目が完了するまで
製品版として公開しない。

## 現在確認できる機能

| 領域 | 状態 |
| --- | --- |
| Dashboard CRUD | Sessions / People / Projects / Reviews / Knowledge / Templatesを管理可能 |
| ローカル保存 | schema検証、サイズ上限、原子的更新、owner-only権限、bounded backup |
| 起動領域 | new / resume / demoを分離 |
| 音声入力 | マイク、VAD、whisper.cpp日本語STTを実装 |
| ローカルLLM | Ollama検出、モデル取得、構造化生成、timeout、retry、fallbackを実装 |
| Consent | セッション単位の3項目確認と本文なし監査記録 |
| Share Safe Mode | overlay本文を即時遮蔽 |
| 保存ポリシー | 音声非保存、transcript / summary / AI出力は既定OFF |
| データ制御 | JSON export、workspace / backup / tempの全削除 |
| CI | JS/Rustの検査、依存監査、privacy audit、release preflight |
| Release | 3 OSアプリbuild、4ターゲットCLI build・CRUD smoke・checksumを定義 |

## P0: 公開ブロッカー

### 署名と実機

- macOS Developer ID署名とnotarizationが未確認
- Windowsコード署名が未確認
- macOS arm64 / x64、Windows x64、Linux x64の実機install smoke testが未実施
- 初回draft Releaseのasset内容とインストール結果が未確認

### 公開identity

- 現行ファイルの既知の個人識別情報は匿名化済み
- Git履歴のauthor metadataとremote URLには個人identityが残る
- 履歴書換えまたは非個人Organizationへの移管方針が未決定

Git履歴の書換えは全commit ID、既存clone、open PR、tagへ影響するため、通常の
コード変更と分けて実施する。

### 成果物の保証

- アプリ成果物を含むSBOM生成が未実装
- Tauri Updaterと更新署名が未実装
- 主要CRUDのPlaywright E2Eが未実装
- 保存、STT、LLMの障害系integration testは拡充が必要

## P1: 公開前に完了する項目

- Privacy Notice、安全利用・同意ガイド、Security Policyの法務・運用レビュー
- セッションごとの参照Knowledge選択
- 保存・IPC・overlay・event失敗のエラーUIと再試行
- 個人情報を除外した構造化ログと診断情報export
- accessibility、keyboard、狭い画面の実機監査
- model license、第三者ライセンス、配布Noticeの確認

## 自動化済みのrelease gate

タグReleaseでは次を実行する。

1. タグと4箇所のversion、pnpm versionの整合性検査
2. privacy audit、JavaScript/Rust依存監査
3. spec、lint、typecheck、test、build
4. Rust fmt、clippy、check、test、build
5. 3 OSのTauri bundle作成
6. 4ターゲットのCLI buildと隔離CRUD smoke test
7. CLI archiveとSHA-256 checksumのdraft Release添付

## リリース判定

`docs/release-checklist.md`の必須項目をすべて完了し、結果を作業報告書へ記録する。
自動workflow成功だけで公開可とは判定しない。

外部ブロッカー:

- Apple / Windows署名identityとSecrets
- 各OS実機または信頼できるテスト環境
- 公開先OrganizationとGit履歴identity方針
- Privacy Noticeと安全利用文書の最終責任者レビュー
