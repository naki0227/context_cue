# ADR 0004: AI Agent CLIはGUIと保存層を共有し排他制御する

## 背景

How to TalkのSessions、People、Projects、Reviews、Knowledge、TemplatesをAI Agentから操作したい。GUIと別の保存形式やAPIを追加すると、ローカルファースト性とデータ整合性を損なう。

## 課題

- GUIとCLIでデータ定義や保存処理を二重管理しない
- AI Agentが安定したJSON入出力と終了コードを使える
- アプリとCLIの同時書込みで更新を失わない
- 個人情報をクラウドやシェル履歴へ不要に残さない
- 将来のworkspace schemaを古いCLIが破壊しない

## 選択肢

1. CLI専用のJSONファイルを作る
2. デスクトップアプリへlocalhost APIを追加する
3. Rustの共通保存crateを作り、GUIとCLIで同じworkspaceを使う

## 採用した案

選択肢3を採用する。`context-cue-workspace`へ原子的保存、権限、上限、復旧、排他ロックを集約する。`context-cue-cli`は同じworkspaceを型検証してCRUDする。

## 採用理由

アプリを起動しなくてもAI Agentが操作でき、外部ポートや認証面を増やさずに済む。保存形式と安全要件をGUIと共有できるため、長期的な差分を抑えられる。

## メリット

- クラウド送信やlocalhost APIが不要
- GUIとCLIで原子的保存、0600権限、10MiB上限を共有できる
- OSレベルの排他ロックで同時書込みを拒否できる
- JSON入出力、JSON Schema、終了コードをAgentへ提供できる
- リソース削除後の関連整合性を保存前に正規化できる

## デメリット

- デスクトップアプリ起動中はCLIの変更操作ができない
- workspace schema変更時にRust型とJSON Schemaの同時更新が必要
- 配布版CLIはデスクトップインストーラとは別に成果物を用意する必要がある

## 将来的な見直し条件

アプリ起動中のAgent操作が必須になった場合は、認証済みIPCまたは明示的なAgentセッションを検討する。SQLite移行時は同じrepository interfaceを維持し、トランザクションとmigrationへ排他制御を移す。
