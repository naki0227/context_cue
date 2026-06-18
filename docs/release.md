# 配布手順

## 目的

このドキュメントは、How to Talk を非エンジニア向けに GitHub Releases から配布できるようにするための手順をまとめたものです。

## 配布の考え方

このプロジェクトは Tauri ベースのデスクトップアプリです。

一般ユーザー向けには、ソースコードを clone して起動してもらうのではなく、GitHub Releases にアップロードされた配布物をダウンロードして使ってもらいます。

想定する配布物:

- macOS: `.dmg`
- Windows: `.msi` または `.exe`
- Linux: `.AppImage` / `.deb` / `.rpm`

## すでに入っているもの

このリポジトリには以下が設定済みです。

- Tauri の bundle 対象設定
- GitHub Releases 用の workflow
- README からの配布導線

workflow は [release.yml](../.github/workflows/release.yml) にあります。

## リリースの作り方

### 1. まず通常開発を `main` に反映する

必要な変更を commit / push します。

### 2. バージョンを更新する

Tauri 公式では `tauri.conf.json > version` での管理が推奨されています。必要に応じて以下も揃えます。

- `apps/desktop/src-tauri/tauri.conf.json`
- ルート `package.json`
- `apps/desktop/package.json`
- `apps/desktop/src-tauri/Cargo.toml`

### 3. Git タグを切る

例:

```bash
git tag v0.1.1
git push origin v0.1.1
```

この tag push をトリガーに GitHub Actions が実行され、GitHub Release が作成されます。

## workflow の動き

この workflow は以下を行います。

1. macOS / Windows / Linux でビルド
2. Tauri bundle を作成
3. GitHub Release を作成または更新
4. bundle を Release assets にアップロード

## 必要な GitHub Secrets

### すぐ使えるもの

- `GITHUB_TOKEN`

これは GitHub Actions で自動提供されます。

### macOS を実用配布する場合

macOS は direct download 配布でも、実運用では署名と notarization が重要です。

必要になる代表的な secrets:

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`

この設定がない場合でも build 自体は通ることがありますが、配布品質としては不十分です。

### Windows を実用配布する場合

代表的な secrets:

- `WINDOWS_CERTIFICATE`
- `WINDOWS_CERTIFICATE_PASSWORD`

証明書なしでもファイル生成はできる場合がありますが、一般配布には署名が望ましいです。

## 最初の運用方針

MVP ではまず以下で十分です。

- Linux bundle は unsigned で作成
- Windows bundle は unsigned で試験配布
- macOS はまず内部確認用に生成
- 実際に広く配布する前に macOS / Windows の署名設定を入れる

## 一般ユーザーへの案内

README や Release 本文には、以下のように案内するのが自然です。

- 開発者はソースコードから起動可能
- 一般ユーザーは Releases から自分の OS 向けファイルをダウンロード
- macOS では Gatekeeper の警告が出る可能性がある

## 今後の拡張

将来的には以下を追加できます。

- Tauri Updater によるアプリ内自動更新
- draft release から本公開への運用
- changelog 自動生成
- prerelease チャンネル
