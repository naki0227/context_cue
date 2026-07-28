# 作業報告書

## 作業日時

2026年07月29日 00時38分19秒

## 作業対象

公開Release専用リポジトリ、cross-repository Release workflow、公開Issue relay、
公開READMEとサポート文書。

## 作業目的

開発リポジトリのソース、履歴、URL、commit、author metadataを公開先へ渡さず、
一般ユーザー向け配布と公開Issueだけを別リポジトリで運用できるようにする。

## 変更内容

- TauriとCLIのdraft Release公開先を`enludus/How-to-talk`へ切り替えた
- 公開側tagの基点を公開側`main`へ固定し、自動生成Release Notesを無効化した
- 詳細な製品README、インストール・更新導線、Privacy、Security、Supportを追加した
- 不具合・機能要望Issue Formを追加した
- `relay-to-team`ラベルで承認した公開Issueだけを内部Issueへ複製するworkflowを追加した
- 内部URL、内部Issue番号、APIレスポンスを公開ログ・コメントへ出さないようにした
- 公開scaffoldから開発元identity、remote、メール、絶対path、commit SHAを拒否する監査を追加した
- 公開scaffoldだけから独立root commitを作成し、公開identityだけであることを確認した

## 変更したファイル

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `package.json`
- `README.md`
- `docs/release.md`
- `docs/release-repository-setup.md`
- `docs/TODO.md`
- `scripts/release-repository-audit.mjs`
- `scripts/release-repository-audit.test.mjs`
- `distribution/release-repository/`配下
- `docs/reports/2026-07-29-release-repository-bridge-report.md`

## 変更意図

collaborator関係やGit mirrorを作らず、権限を単一リポジトリ・単一用途へ限定したPATで
成果物とIssueだけを一方向に転送するため。

## 設計上の意図

公開Issueは外部入力として扱い、shellへ展開せずNodeの`fetch`からJSON送信する。
公開Issueの自動転送はspamを内部へ流すため、maintainerによるラベル承認を必須にした。
Updaterは署名鍵なしで仮有効化せず、鍵生成とSecret登録後に実装する。

## 影響範囲

- `vX.Y.Z`のRelease成果物は開発リポジトリではなく公開配布リポジトリへ作成される
- 公開配布リポジトリの`main`初期化前はRelease作成できない
- 公開Issueは承認ラベルを付けるまで内部へ複製されない
- アプリ本体、workspace schema、DB、実ユーザーデータに変更はない

## 追加・更新したテスト

- 独立した公開scaffoldを許可する監査テスト
- 開発元参照、メール、絶対home path、commit SHAを拒否する監査テスト
- CIとRelease quality gateへ公開scaffold監査を追加

## 実行した確認コマンド

- `corepack pnpm install --frozen-lockfile`
- `corepack pnpm audit:privacy`
- `corepack pnpm audit:release-repository`
- `corepack pnpm release:check`
- `corepack pnpm spec:check`
- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `cargo fmt --all -- --check`
- `cargo check --workspace`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo test --workspace`
- `cargo build --workspace`
- `cargo audit`
- workflowとIssue FormのYAML parse
- 公開scaffoldだけからの独立Git root commit作成とtree・author監査
- `git diff --check`

結果:

- Nodeテスト13件成功
- Vitest 43件成功
- Rustテスト45件成功、実機Whisperテスト1件は意図的ignore
- lint、typecheck、frontend build、Rust fmt/check/clippy/build成功
- privacy audit、release repository audit、release preflight成功
- Rust auditは終了成功、許可済み警告17件
- 公開scaffold内の開発元参照0件
- 独立root commitは8ファイルだけで、公開identityのみ

## CIで確認される内容

- privacyと公開scaffoldの分離
- 依存監査、SPEC同期、release metadata
- frontend lint、typecheck、test、build
- Rust fmt、clippy、check、test、build、audit
- Release時の3 OSアプリbuild、4ターゲットCLI build、隔離CRUD smoke、checksum

## 未解決の課題

- 公開リポジトリへ全8ファイルをWeb上で反映済み
- remote cloneとローカルscaffoldの差分は0件
- 公開側Issue relay workflowはGitHub Actionsでactive
- `relay-to-team`ラベルを作成済み
- 個人情報を含まない公開Issueで中継を実地確認済み
- Actions run `30376087020`は成功し、公開Issueへ`relayed-internally`と汎用コメントが付与された
- ユーザー確認により非公開トラッカーへのIssue作成も成功した
- Tauri Updater署名鍵、`latest.json`、アプリ内更新UIは未実装
- macOS署名・公証、Windows署名、3 OS実機smoke testが未完了
- Rust auditの許可済み警告17件が残る

## 次にやること

1. 開発側変更をcommit・pushしてcross-repository Release workflowを有効化する
2. Updater署名鍵を生成し、private keyをGitHub Secretへ登録する
3. アプリ内Updaterと署名付き`latest.json`を実装する
4. 個人情報を含まないテストtagで初回draft Releaseを検証する

## 次回最初に見るべきファイル

- `docs/release-repository-setup.md`
- `distribution/release-repository/README.md`
- `distribution/release-repository/.github/workflows/relay-approved-issue.yml`
- `.github/workflows/release.yml`
- `docs/TODO.md`

## 引き継ぎ事項

公開側へ開発リポジトリをclone・mirrorしない。初回pushでは
`distribution/release-repository/`の8ファイルだけを使用する。

公開リポジトリへ開発用accountをcollaborator追加しない。Token値、内部owner、
内部repository名をActionsログ、Issue、artifactへ出さない。

## 追記: Issue中継の実地確認

作業日時: 2026年07月29日 01時00分46秒

- 公開APIで`relay-to-team`ラベルの存在を確認した
- 公開Issue #1へのラベル付与でActionsが起動した
- ラベル付与前のrunは条件どおりskip、付与後のrunはsuccessだった
- 公開Issueには`relayed-internally`ラベルと内部参照を含まないコメントだけが追加された
- 非公開側への作成成功はユーザーが確認した
- 認証情報、非公開リポジトリの内容、実ユーザーデータは確認対象にしていない
