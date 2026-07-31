# How to Talk

How to Talkは、会議、面接、メンタリング、1on1などの会話中に、自分が準備した
メモや資料を思い出しやすくするローカルファーストの会話支援アプリです。

[![インストール／最新版に更新](https://img.shields.io/badge/How_to_Talk-インストール／最新版に更新-0b6e4f?style=for-the-badge)](https://enludus.github.io/How-to-talk/install/)

初めて使う場合も、インストール済みのアプリを更新する場合も、上のボタンを
使用してください。端末に合うインストーラだけを案内します。同じアプリ識別子の
インストーラが新規導入か更新かを判断し、更新時もローカルのワークスペースを
引き継ぎます。念のため、重要なデータは更新前にアプリからexportしてください。

## できること

- 会話前の準備メモ、人物、プロジェクト、決定事項をローカルで整理
- 会話中に必要な情報を上部・右側のオーバーレイへ表示
- 明示的に読み込んだ資料から関連情報を検索
- 端末内の音声認識とローカルAIを使った会話支援
- 画面共有時に内容を隠すShare Safe Mode
- ワークスペースのJSON exportと復元

## 大切な方針

How to Talkは、参加者の同意を得た会話で利用してください。無断録音、隠れた
文字起こし、回答代行を目的としたツールではありません。

- 生音声は保存しません
- 文字起こし・要約・AI出力は既定で保存しません
- 個人ナレッジと設定は端末内へ保存します
- 外部クラウドへの自動送信は標準では有効にしていません

## 対応環境

| OS | 配布形式 |
| --- | --- |
| macOS | Apple Silicon / Intel向けDMG |
| Windows | 64-bit向けMSIまたはセットアップEXE |
| Linux | AppImage / deb / rpm |
| CLI | macOS / Windows / Linux向けarchive |

通常は上のインストールボタンがOSに合う候補だけを表示します。macOSでCPU種別を
確認する場合は、Appleメニューの「このMacについて」を開いてください。M1以降は
Apple Siliconです。各CLI archiveにはSHA-256 checksumを添付します。

## インストールと更新

1. [最新Release](https://github.com/enludus/How-to-talk/releases/latest)を開きます。
2. お使いのOS向けインストーラをダウンロードします。
3. 配布元の署名を確認してからインストーラを実行します。
4. インストール済みの場合は、同じ手順で最新版へ更新します。

署名確認に失敗する場合やOSの安全機能が警告する場合は、回避操作をせず、
[Issue](https://github.com/enludus/How-to-talk/issues/new/choose)で報告してください。

## サポート

不具合や機能要望は[公開Issue](https://github.com/enludus/How-to-talk/issues)で
受け付けます。Issueは公開情報です。氏名、メールアドレス、会話内容、録音、
アクセストークン、端末の個人パスなどを投稿しないでください。

- [不具合を報告](https://github.com/enludus/How-to-talk/issues/new?template=bug-report.yml)
- [機能を提案](https://github.com/enludus/How-to-talk/issues/new?template=feature-request.yml)
- [Privacy Notice](./PRIVACY.md)
- [Security Policy](./SECURITY.md)
- [Support Guide](./SUPPORT.md)

このリポジトリは、一般ユーザー向けの配布物とサポート窓口だけを管理します。
