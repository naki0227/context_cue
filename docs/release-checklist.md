# リリースチェックリスト

## 判定ルール

必須項目が1つでも未完了なら、Releaseはdraftのままにする。実行結果、署名確認、実機確認の担当者と日時をRelease作業記録へ残す。

## 事前確認

- [ ] `main`が保護され、必須CIが成功している
- [ ] `corepack pnpm release:check -- --tag vX.Y.Z`が成功する
- [ ] `corepack pnpm audit:privacy`が成功する
- [ ] `corepack pnpm spec:check`が成功する
- [ ] `corepack pnpm audit --audit-level high`が成功する
- [ ] `cargo audit`の警告を確認し、許容理由を記録する
- [ ] `CHANGELOG.md`の対象バージョンと日付を確定する
- [ ] Privacy Notice、安全利用ガイド、SPECに挙動差分がない
- [ ] Git履歴とremoteの公開用identity監査が完了している

## 署名と成果物

- [ ] macOS署名identityとnotarization secretsを設定した
- [ ] Windowsコード署名証明書を設定した
- [ ] macOS arm64 / x64、Windows x64、Linux x64のアプリ成果物がある
- [ ] 4ターゲットのCLI archiveとSHA-256ファイルがある
- [ ] 公開する全成果物のSBOMがある
- [ ] Release notesに既知の制約とrollback方法がある

## 実機smoke test

- [ ] macOS arm64でインストール、起動、マイク権限、アンインストールを確認した
- [ ] macOS x64でインストール、起動、マイク権限、アンインストールを確認した
- [ ] Windows x64でインストール、起動、マイク権限、アンインストールを確認した
- [ ] Linux x64でインストール、起動、音声入力、アンインストールを確認した
- [ ] 各OSでnew / resume / demoの保存領域分離を確認した
- [ ] 保存OFFで音声・文字起こし・要約・AI本文が残らない
- [ ] Share Safe Modeで共有画面へ本文が露出しない
- [ ] export、全削除、破損workspace復旧を確認した
- [ ] CLI archiveを展開し、`--version`、SPEC、Schema、隔離CRUDを確認した

## 公開

- [ ] draft Releaseのasset名、サイズ、checksumを照合した
- [ ] インストール手順と署名状態を最終確認した
- [ ] rollback対象の直前バージョンと手順を確認した
- [ ] `Publish Beta Release`で対象tag、実機確認、`publish vX.Y.Z`を明示確認した
- [ ] Pre-releaseとして公開し、公開後にダウンロードを再確認した

## Rollback

重大な不具合がある場合はReleaseを非推奨として明示し、ダウンロード導線を直前の安全な版へ戻す。保存schemaに変更がある場合は、旧版へ戻す前にexportし、互換性またはmigration手順を確認する。公開済みtagや成果物を無言で差し替えない。
