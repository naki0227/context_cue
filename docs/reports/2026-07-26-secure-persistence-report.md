# 作業報告書

## 作業日時

2026年07月26日 17時11分07秒

## 作業対象

workspace永続化、Tauri IPCエラー伝播、Frontend保存制御。

## 作業目的

個人情報を含むworkspaceの権限過多、途中書込み、破損、無制限保存、エラー握り潰しを防ぐ。

## 変更内容

- persistenceをmodel、validation、file store、公開APIへ分割した。
- 保存ファイルをUnixで0600へ制限した。
- 同一ディレクトリの一時ファイルへ書き、fsync後にrenameするようにした。
- schema version 3、10MiB上限、必須配列、各1万件上限を検証するようにした。
- 破損時に最新の正常バックアップから復旧するようにした。
- バックアップ保持を5件に制限した。
- 保存成功後だけ共有メモリへ変更を反映するようにした。
- Mutex poisoningと保存失敗をResultでIPCまで伝播するようにした。
- テストは一時保存先を注入し、実ユーザーデータへ触れないようにした。
- Frontend保存を250ms遅延し、読込・保存・overlay失敗を画面表示するようにした。
- controllerからworkspace保存とKnowledge importを専用hookへ分離した。

## 変更したファイル

- `apps/desktop/src-tauri/src/infrastructure/persistence/`
- `apps/desktop/src-tauri/src/app.rs`
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src-tauri/src/error.rs`
- `apps/desktop/src/features/dashboard/hooks/`
- `apps/desktop/src/features/dashboard/components/dashboard-shell.tsx`
- `apps/desktop/src/features/overlay/lib/overlay-view-model.ts`
- `apps/desktop/src/styles/globals.css`
- `docs/TODO.md`

## 変更意図

保存失敗を成功として扱わず、書込み途中のJSONや過剰権限の平文ファイルを残さないため。

## 設計上の意図

ファイルI/Oはinfrastructure、workspace制約はvalidation、状態更新順序はapplication state、表示はfeature hookへ分離した。

## 影響範囲

起動時読込、全CRUD、自動保存、Consent監査記録、デモ/ユーザー保存領域。

## 追加・更新したテスト

- 0600とschema version
- 必須collectionとサイズ上限
- 破損バックアップ復旧
- バックアップ5件制限
- Consent監査の非機密性
- 一時保存先を使うSharedStateテスト

## 実行した確認コマンド

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo test --workspace`

すべて成功した。

## CIで確認される内容

依存監査、format、lint、typecheck、unit test、check、build。

## 未解決の課題

- Windowsでは0600相当のACLをインストール実機で確認する必要がある。
- 全データ削除とユーザー指定先exportは未実装。
- エラー表示に明示的な再試行ボタンは未実装。

## 次にやること

全データ削除、export、診断情報exportを実装する。

## 次回最初に見るべきファイル

- `apps/desktop/src-tauri/src/infrastructure/persistence/mod.rs`
- `apps/desktop/src-tauri/src/commands.rs`
- `apps/desktop/src/features/dashboard/components/settings/`

## 引き継ぎ事項

workspace上限を変更する場合はRustとUIの双方へ理由を記録する。保存前検証と保存成功後のメモリ反映順序を逆転させない。
