# Release専用リポジトリ設定

## 目的

`enludus/How-to-talk`を一般ユーザー向けの配布・サポート専用リポジトリとして使う。
開発リポジトリのソース、履歴、URL、commit SHA、author metadataは公開側へ同期しない。

## 公開するファイル

`distribution/release-repository/`の内容だけを、独立したGitリポジトリのルートへ配置する。
開発リポジトリ全体をclone、mirror、submodule、subtreeとして追加してはいけない。

投入前に次を実行する。

```bash
corepack pnpm audit:privacy
corepack pnpm audit:release-repository
```

公開側の初回commit authorは公開identityだけを使う。開発用Git設定を流用しない。

```bash
git config user.name "How to Talk Release"
git config user.email "enludus@users.noreply.github.com"
```

## Secret

開発リポジトリ:

| Secret | 権限 |
| --- | --- |
| `RELEASE_REPOSITORY_TOKEN` | 公開配布リポジトリだけに`Contents: write` |

公開配布リポジトリ:

| Secret | 権限・値 |
| --- | --- |
| `SOURCE_ISSUE_TOKEN` | 開発リポジトリだけに`Issues: write` |
| `SOURCE_REPOSITORY_OWNER` | 開発リポジトリのowner |
| `SOURCE_REPOSITORY_NAME` | 開発リポジトリ名 |

Token値と開発リポジトリ識別子を公開workflow、Issue、コメント、Actions artifactへ
書き出さない。

## Issue relay

公開Issueを確認し、内部対応が必要な場合だけmaintainerが`relay-to-team`ラベルを付ける。
workflowは公開Issueの内容を内部トラッカーへ複製し、公開側には
`relayed-internally`ラベルと一般的な受付コメントだけを残す。

公開Issue本文は外部入力である。shell commandやファイルパスとして解釈しない。

## Release

開発リポジトリで`vX.Y.Z`タグをpushすると、quality gate後に公開配布リポジトリへ
draft Releaseを作成する。公開側のtagは公開側`main`を指し、開発元commitを指さない。
自動生成Release Notesは使用しない。

署名、notarization、checksum、実機smoke testを確認するまでdraftを公開しない。
