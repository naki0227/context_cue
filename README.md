# How to Talk

How to Talk は、現在 **Context Cue** の表示名として使っている名称です。

このプロジェクトは、参加者の同意を得た会話に対して、ローカル環境で動作する支援オーバーレイを提供します。会議、面接、メンタリング、1on1 などの場面で、過去メモ、関連資料、決定事項、自分の文脈情報を会話中に思い出しやすくすることを目的としています。

無断録音、隠れた文字起こし、回答代行を目的としたツールではありません。

## 現在の状態

このリポジトリには、Phase 0 の MVP 雛形が入っています。

- Tauri v2 デスクトップアプリの骨格
- React + TypeScript のフロントエンド
- Rust 製の状態管理とコマンド層
- モック文字起こしパイプライン
- 質問判定つき Adaptive Inference の概念実装
- サンプルプロフィール読み込みとキーワード検索

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
   `corepack pnpm --filter desktop tauri dev`

## 一般ユーザー向け配布

非エンジニア向けには、GitHub から clone して起動する形ではなく、GitHub Releases からインストーラや配布ファイルをダウンロードして使う想定です。

- macOS: `.dmg`
- Windows: `.msi` または `.exe`
- Linux: `.AppImage` / `.deb` / `.rpm`

配布フローの詳細は [配布手順](./docs/release.md) にまとめています。

## 命名方針

- リポジトリ名 / 技術上の識別子: `context-cue`
- 現在の表示名: `How to Talk`

内部識別子は安定させつつ、ユーザー向け名称は後から調整しやすいように分けています。

## ドキュメント

- [要件定義書](./docs/requirements.md)
- [アーキテクチャ設計](./docs/architecture.md)
- [実装計画](./docs/implementation-plan.md)
- [配布手順](./docs/release.md)
