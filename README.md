# How to Talk

How to Talk は、現在 **Context Cue** の表示名として使っている名称です。

このプロジェクトは、参加者の同意を得た会話に対して、ローカル環境で動作する支援オーバーレイを提供します。会議、面接、メンタリング、1on1 などの場面で、過去メモ、関連資料、決定事項、自分の文脈情報を会話中に思い出しやすくすることを目的としています。

無断録音、隠れた文字起こし、回答代行を目的としたツールではありません。

## 現在の状態

このリポジトリには、ローカルファーストのデスクトップアプリとして動作する実装が入っています。

- Tauri v2 デスクトップアプリ
- React + TypeScript のダッシュボード UI
- 上部 / 右側の会話支援オーバーレイ
- Rust 製の状態管理とコマンド層
- モック文字起こしパイプライン
- 質問判定つき Adaptive Inference
- サンプルプロフィール読み込みとキーワード検索
- 個人ナレッジと Share Safe Mode のローカル永続化
- Overlay Settings のブラウザ側永続化とダッシュボード実データのRust側永続化

## 起動方法

1. Corepack で `pnpm` を有効化する  
   `corepack enable && corepack prepare pnpm@10.15.1 --activate`
2. 依存をインストールする  
   `corepack pnpm install`
3. フロントエンドのテストを実行する  
   `corepack pnpm test`
4. Rust のテストを実行する  
   `cargo test`
5. デスクトップアプリを起動する
   - 新規起動（空から開始）: `corepack pnpm tauri:dev:new`
   - 再開（本人データを復元）: `corepack pnpm tauri:dev:resume`
   - デモ起動（シードデータ入り）: `corepack pnpm tauri:dev:demo`

新規起動では既存の本人データを日時付きバックアップへ退避してから空の
ワークスペースを開始します。新規起動後に入力した内容は、次回の再開で
復元されます。デモ起動はダッシュボード・個人ナレッジ・同意状態・
オーバーレイ設定を別の保存領域に保持します。配布用ビルドと起動モード
未指定時は再開となり、サンプル情報は自動投入されません。

ダッシュボードの実データはRust側のローカルJSONだけを正本とし、WebViewの
ブラウザキャッシュには重複保存しません。

## 一般ユーザー向け配布

非エンジニア向けには、GitHub から clone して起動する形ではなく、GitHub Releases からインストーラや配布ファイルをダウンロードして使う想定です。

- macOS: `.dmg`
- Windows: `.msi` または `.exe`
- Linux: `.AppImage` / `.deb` / `.rpm`

配布フローの詳細は [配布手順](./docs/release.md) にまとめています。

## ローカル保存とプライバシー

How to Talk はローカル実行を前提にしています。

- 個人ナレッジはローカルに保存されます
- Overlay Settings とダッシュボードの下書きは端末内に保持されます
- セッション中のモック transcript は永続化しません
- 外部クラウドへ自動送信する構成は標準では有効にしていません

詳細は [SECURITY.md](./SECURITY.md) を参照してください。

## 命名方針

- リポジトリ名 / 技術上の識別子: `context-cue`
- 現在の表示名: `How to Talk`

内部識別子は安定させつつ、ユーザー向け名称は後から調整しやすいように分けています。

## ドキュメント

- [要件定義書](./docs/requirements.md)
- [アーキテクチャ設計](./docs/architecture.md)
- [実装計画](./docs/implementation-plan.md)
- [配布手順](./docs/release.md)
- [本番リリース準備監査](./docs/production-readiness-audit.md)
- [My Knowledge入力ガイド](./docs/my-knowledge-guide.md)
