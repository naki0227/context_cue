# 作業報告書

## 作業日時

2026年07月28日 22時03分12秒

## 作業対象

インストール済み `how-to-talk 0.1.0` の AI Agent 向け CLI。

## 作業目的

CLI の help、SPEC、JSON Schema だけを判断材料にし、実ユーザーデータへ触れずに隔離領域で CRUD を一巡できるか確認する。

## 変更内容

- `/private/tmp/how-to-talk-crud.pdaWKK` を専用データディレクトリとして作成した。
- `knowledge` を1件作成し、一覧・単体取得・部分更新・削除を確認した。
- 未知フィールドが保存前に拒否されること、削除後に対象なしとなることを確認した。
- リポジトリのソースコードは読んでいない。

## 変更したファイル

- `docs/reports/2026-07-28-installed-cli-black-box-crud-report.md`
- `docs/TODO.md`

CLI が一時領域へ生成したファイル:

- `/private/tmp/how-to-talk-crud.pdaWKK/workspace-state-v2.json`

## 変更意図

インストール済み CLI を利用者と同じ公開インターフェースから検証し、本人用 workspace に影響しない操作手順と仕様上の不足を記録するため。

## 設計上の意図

`--data-dir` を全データ操作へ明示し、既定保存先と `--demo` を使わないことで検証データを隔離した。入力は架空の非機密データに限定し、stdin 経由で渡した。

## 影響範囲

製品コード、実ユーザー workspace、デモ workspace、API、DBへの変更はない。一時領域内の `knowledge` は削除済みで、最終一覧は空である。

一時ディレクトリの権限は `700`、workspace ファイルは `600` だった。

## 追加・更新したテスト

自動テストは追加していない。次のブラックボックス確認を実施した。

- Create: ID と省略時の初期値が補完される
- Read: List と Get が作成内容を返す
- Update: トップレベルの部分更新と配列置換が反映される
- Validation: 未知フィールドが終了コード2で拒否され、既存値が維持される
- Delete: 削除結果が返り、最終 List が空になる
- Not found: 削除後 Get が終了コード3を返す

## 実行した確認コマンド

- `how-to-talk --help`
- `how-to-talk --version`
- `how-to-talk spec`
- `how-to-talk schema`
- `how-to-talk schema knowledge`
- `how-to-talk <subcommand> --help`（path / list / get / create / update / delete）
- `how-to-talk --data-dir /private/tmp/how-to-talk-crud.pdaWKK path`
- `how-to-talk --data-dir /private/tmp/how-to-talk-crud.pdaWKK list knowledge`
- `how-to-talk --data-dir /private/tmp/how-to-talk-crud.pdaWKK create knowledge --data -`
- `how-to-talk --data-dir /private/tmp/how-to-talk-crud.pdaWKK get knowledge <ID>`
- `how-to-talk --data-dir /private/tmp/how-to-talk-crud.pdaWKK update knowledge <ID> --data -`
- `how-to-talk --data-dir /private/tmp/how-to-talk-crud.pdaWKK delete knowledge <ID>`
- `stat -f '%Sp %N' /private/tmp/how-to-talk-crud.pdaWKK /private/tmp/how-to-talk-crud.pdaWKK/workspace-state-v2.json`

すべて期待通り成功した。意図的な未知フィールド更新は終了コード2、削除後 Get は終了コード3だった。

## CIで確認される内容

SPEC では TypeScript の lint、typecheck、unit test、build、Rust の fmt、clippy、check、test、build、JavaScript/Rust の依存脆弱性監査が CI 対象とされている。今回は製品コードを変更していないため CI は実行していない。

## 未解決の課題

- Schema は保存済みレコードを表し、Create 入力では省略できる `id` と `updatedAt` も required になっている。Create / Update / Response の schema が分離されていない。
- 省略項目の「安全な初期値」の具体値がリソース別に記載されていない。今回の Create では `sourceLabel: "本人入力"` と空の `updatedAt` が補完された。
- 日時文字列の format、空文字の可否、文字列・配列のサイズ上限がリソース schema から分からない。
- Delete 成功時に削除済みレコードを返すことは入出力契約に明記されていない。
- SPEC は `1.0.0-draft` で、対象アプリは `0.1.x` と幅があるため、CLI `0.1.0` との厳密な対応関係が分からない。

## 次にやること

Create / Update / Response 用 schema と既定値を公開仕様へ追加し、CLI のブラックボックス CRUD を自動化する。

## 次回最初に見るべきファイル

- `docs/reports/2026-07-28-installed-cli-black-box-crud-report.md`
- `docs/TODO.md`

次回最初に実行するコマンドは `how-to-talk --version` と `how-to-talk spec`。

## 引き継ぎ事項

検証時は必ず新しい `mktemp -d` の結果を `--data-dir` へ指定する。既定の `how-to-talk path` は実ユーザー領域を示す可能性があるため、隔離検証では実行しない。今回の一時 workspace はレコード削除済みだが、空の workspace ファイルとディレクトリは残っている。
