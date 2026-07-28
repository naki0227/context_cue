# 配布手順

## 目的

このドキュメントは、How to Talk を非エンジニア向けに GitHub Releases から配布できるようにするための手順をまとめたものです。

## 配布の考え方

このプロジェクトは Tauri ベースのデスクトップアプリです。

一般ユーザー向けには、ソースコードを clone して起動してもらうのではなく、GitHub Releases にアップロードされた配布物をダウンロードして使ってもらいます。

公開先は`enludus/How-to-talk`です。公開先には配布物、一般ユーザー向け文書、
Issueテンプレートだけを置きます。開発リポジトリのソース、Git履歴、URL、
commit SHA、author metadataは同期しません。

想定する配布物:

- macOS: `.dmg`
- Windows: `.msi` または `.exe`
- Linux: `.AppImage` / `.deb` / `.rpm`
- CLI: OS・CPU別archiveとSHA-256 checksum

## すでに入っているもの

このリポジトリには以下が設定済みです。

- Tauri の bundle 対象設定
- GitHub Releases 用の workflow
- README からの配布導線
- Release前のCI相当quality gate
- CLIの隔離CRUD smoke testとchecksum生成
- 公開配布リポジトリ専用scaffoldとprivate-source reference監査

workflow は [release.yml](../.github/workflows/release.yml) にあります。

## リリースの作り方

### 1. まず通常開発を `main` に反映する

必要な変更を commit / push します。

次をローカルで確認します。

```bash
corepack enable
corepack prepare pnpm@11.17.0 --activate
corepack pnpm install --frozen-lockfile
corepack pnpm audit:privacy
corepack pnpm release:check
corepack pnpm spec:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo check --workspace
cargo test --workspace
cargo build --workspace
```

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
タグは4箇所のバージョンと一致しない場合にquality gateで拒否されます。

手動実行では、既に存在する`vX.Y.Z`タグを入力します。branch名からReleaseを
作ることはできません。

## workflow の動き

この workflow は以下を行います。

1. privacy、依存監査、spec、lint、typecheck、test、buildを実行
2. macOS / Windows / Linux でTauri bundleを作成
3. draft GitHub Releaseを作成または更新
4. 4ターゲットのCLIをbuildし、隔離領域でCRUD smoke test
5. CLI archiveとSHA-256 checksumをRelease assetsへ追加

workflow成功だけでは公開しません。[リリースチェックリスト](./release-checklist.md)
に従い、署名、実機インストール、Privacy Notice、rollbackを確認してからdraftを
公開します。

## 必要な GitHub Secrets

### すぐ使えるもの

- `GITHUB_TOKEN`

これは GitHub Actions で自動提供されます。

### 公開配布リポジトリ

開発リポジトリのRepository Secret:

- `RELEASE_REPOSITORY_TOKEN`: `enludus/How-to-talk`だけに
  `Contents: write`を持つfine-grained PAT

公開配布リポジトリのRepository Secrets:

- `SOURCE_ISSUE_TOKEN`: 開発リポジトリだけに`Issues: write`を持つfine-grained PAT
- `SOURCE_REPOSITORY_OWNER`: 開発リポジトリowner
- `SOURCE_REPOSITORY_NAME`: 開発リポジトリ名

両アカウントをcollaboratorにしない。公開Issueは`relay-to-team`ラベルが付いた場合だけ
非公開トラッカーへ複製し、内部URL・内部Issue番号は公開側へ返さない。

公開scaffoldを変更した場合は、投入前に次を実行する。

```bash
corepack pnpm audit:release-repository
```

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

## 初回公開の必須方針

- Linuxのunsigned成果物は署名状態をRelease notesへ明記する
- Windowsは内部試験を除き、コード署名後に公開する
- macOSはDeveloper ID署名とnotarization後に公開する
- 3 OSの実機smoke testが終わるまでReleaseをdraftに保つ
- checksumとSBOMが揃うまで製品版として公開しない

## 一般ユーザーへの案内

README や Release 本文には、以下のように案内するのが自然です。

- 開発者はソースコードから起動可能
- 一般ユーザーは Releases から自分の OS 向けファイルをダウンロード
- macOS では Gatekeeper の警告が出る可能性がある

公開文面からGatekeeper回避手順を案内しない。警告が出る成果物は署名・公証状態を
確認し、広範な配布を止める。

## Rollback

重大な不具合が見つかった場合は、対象Releaseを非推奨と明記し、直前の安全な版へ
導線を戻します。公開済みtagやassetを無言で差し替えません。

workspace schema変更を含む場合は、旧版へ戻す前にexportを取得し、migrationと
後方互換性を確認します。bundle identifierの変更を伴う版では、旧開発版の
workspaceが自動移行されないため、必要なデータを事前にexportします。

## 今後の拡張

将来的には以下を追加できます。

- Tauri Updater によるアプリ内自動更新
- draft release から本公開への運用
- prerelease チャンネル
- アプリ成果物を含むSBOMの自動生成
